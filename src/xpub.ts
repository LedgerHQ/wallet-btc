import { flatten, maxBy, range, some, sortBy } from 'lodash';
import { Address, IStorage, Output } from './storage/types';
import EventEmitter from './utils/eventemitter';
import { IExplorer } from './explorer/types';
import { ICrypto } from './crypto/types';

// names inside this class and discovery logic respect BIP32 standard
class Xpub extends EventEmitter {
  storage: IStorage;

  explorer: IExplorer;

  crypto: ICrypto;

  xpub: string;

  derivationMode: string;

  GAP = 20;

  syncing: { [key: string]: boolean } = {};

  // need to be bigger than the number of tx from the same address that can be in the same block
  txsSyncArraySize = 1000;

  constructor({
    storage,
    explorer,
    crypto,
    xpub,
    derivationMode,
  }: {
    storage: IStorage;
    explorer: IExplorer;
    crypto: ICrypto;
    xpub: string;
    derivationMode: string;
  }) {
    super();
    this.storage = storage;
    this.explorer = explorer;
    this.crypto = crypto;
    this.xpub = xpub;
    this.derivationMode = derivationMode;
  }

  async syncAddress(account: number, index: number) {
    const address = this.crypto.getAddress(this.derivationMode, this.xpub, account, index);

    await this.whenSynced('address', address);

    const data = {
      type: 'address',
      key: address,
      account,
      index,
      address,
    };

    this.emitSyncing(data);

    // TODO handle eventual reorg case using lastBlock

    let added = 0;
    let total = 0;

    try {
      // eslint-disable-next-line no-cond-assign,no-await-in-loop
      while ((added = await this.fetchHydrateAndStoreNewTxs(address, account, index))) {
        total += added;
      }
    } catch (e) {
      this.emitSyncedFailed(data);
      throw e;
    }

    this.emitSynced({ ...data, total });

    const lastTx = await this.storage.getLastTx({
      account,
      index,
    });

    return !!lastTx;
  }

  async checkAddressesBlock(account: number, index: number) {
    const addressesResults = await Promise.all(range(this.GAP).map((_, key) => this.syncAddress(account, index + key)));
    return some(addressesResults, (lastTx) => !!lastTx);
  }

  async syncAccount(account: number) {
    await this.whenSynced('account', account.toString());

    this.emitSyncing({
      type: 'account',
      key: account,
      account,
    });

    let index = 0;

    try {
      // eslint-disable-next-line no-await-in-loop
      while (await this.checkAddressesBlock(account, index)) {
        index += this.GAP;
      }
    } catch (e) {
      this.emitSyncedFailed({
        type: 'account',
        key: account,
        account,
      });
      throw e;
    }

    this.emitSynced({
      type: 'account',
      key: account,
      account,
      index,
    });

    return index;
  }

  // TODO : test fail case + incremental
  async sync() {
    await this.whenSynced('all');

    this.emitSyncing({ type: 'all' });

    let account = 0;

    try {
      // eslint-disable-next-line no-await-in-loop
      while (await this.syncAccount(account)) {
        account += 1;
      }
    } catch (e) {
      this.emitSyncedFailed({ type: 'all' });
      throw e;
    }

    this.emitSynced({ type: 'all', account });

    return account;
  }

  async getXpubBalance() {
    await this.whenSynced('all');

    const addresses = await this.getXpubAddresses();

    return this.getAddressesBalance(addresses);
  }

  async getAccountBalance(account: number) {
    await this.whenSynced('account', account.toString());

    const addresses = await this.getAccountAddresses(account);

    return this.getAddressesBalance(addresses);
  }

  async getAddressBalance(address: Address) {
    await this.whenSynced('address', address.address);

    const unspentUtxos = await this.storage.getAddressUnspentUtxos(address);

    return unspentUtxos.reduce((total, { value }) => total + value, 0);
  }

  async getXpubAddresses() {
    await this.whenSynced('all');
    return this.storage.getUniquesAddresses({});
  }

  async getAccountAddresses(account: number) {
    await this.whenSynced('account', account.toString());
    return this.storage.getUniquesAddresses({ account });
  }

  async getNewAddress(account: number, gap: number) {
    await this.whenSynced('account', account.toString());

    const accountAddresses = await this.getAccountAddresses(account);
    const lastIndex = (maxBy(accountAddresses, 'index') || { index: -1 }).index;
    let index: number;
    if (lastIndex === -1) {
      index = 0;
    } else {
      index = lastIndex + gap;
    }
    const address: Address = {
      address: this.crypto.getAddress(this.derivationMode, this.xpub, account, index),
      account,
      index,
    };
    return address;
  }

  async buildTx(destAddress: string, amount: number, fee: number, changeAddress: string, utxosToUse?: Output[]) {
    await this.whenSynced('all');

    // get the utxos to use as input
    // from all addresses of the account
    const addresses = await this.getXpubAddresses();
    let unspentUtxos = flatten(
      await Promise.all(addresses.map((address) => this.storage.getAddressUnspentUtxos(address)))
    );
    unspentUtxos = sortBy(unspentUtxos, 'value');

    // now we select only the output needed to cover the amount + fee
    let total = 0;
    let unspentUtxoSelected: Output[] = [];

    if (utxosToUse) {
      unspentUtxoSelected = utxosToUse;
      total = unspentUtxoSelected.reduce((totalacc, utxo) => totalacc + utxo.value, 0);
    } else {
      let i = 0;
      while (total < amount + fee) {
        if (!unspentUtxos[i]) {
          throw new Error('amount bigger than the total balance');
        }
        total += unspentUtxos[i].value;
        unspentUtxoSelected.push(unspentUtxos[i]);
        i += 1;
      }
    }

    const txHexs = await Promise.all(
      unspentUtxoSelected.map((unspentUtxo) => this.explorer.getTxHex(unspentUtxo.output_hash))
    );
    const txs = await Promise.all(
      unspentUtxoSelected.map((unspentUtxo) => this.storage.getTx(unspentUtxo.address, unspentUtxo.output_hash))
    );

    // formatting approx the ledger way; ledger for the win
    const inputs: [string, number][] = unspentUtxoSelected.map((utxo, index) => [txHexs[index], utxo.output_index]);
    const associatedDerivations: [number, number][] = unspentUtxoSelected.map((utxo, index) => [
      txs[index].account,
      txs[index].index,
    ]);
    const outputs = [
      {
        script: this.crypto.toOutputScript(destAddress),
        value: amount,
      },
      {
        script: this.crypto.toOutputScript(changeAddress),
        value: total - amount - fee,
      },
    ];

    return {
      inputs,
      associatedDerivations,
      outputs,
    };
  }

  async broadcastTx(rawTxHex: string) {
    return this.explorer.broadcast(rawTxHex);
  }

  // internal
  async getAddressesBalance(addresses: Address[]) {
    const balances = await Promise.all(addresses.map((address) => this.getAddressBalance(address)));

    return balances.reduce((total, balance) => (total || 0) + (balance || 0), 0);
  }

  // TODO : test the different syncing protection logic
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emitSyncing(data: any) {
    this.syncing[`${data.type}-${data.key}`] = true;
    this.emit('syncing', data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emitSynced(data: any) {
    this.syncing[`${data.type}-${data.key}`] = false;
    this.emit('synced', data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emitSyncedFailed(data: any) {
    this.syncing[`${data.type}-${data.key}`] = false;
    this.emit('syncfail', data);
  }

  whenSynced(type: string, key?: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.syncing[`${type}-${key}`]) {
        resolve();
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handler = (evt: any) => {
          if (evt.type === type && evt.key === key) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            this.off('synced', handler);
            resolve();
          }
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        this.on('synced', handler);
      }
    });
  }

  async fetchHydrateAndStoreNewTxs(address: string, account: number, index: number) {
    const lastTx = await this.storage.getLastTx({
      account,
      index,
    });

    const txs = await this.explorer.getAddressTxsSinceLastTxBlock(
      this.txsSyncArraySize,
      { address, account, index },
      lastTx
    );
    const inserted = await this.storage.appendTxs(txs);
    return inserted;
  }
}

export default Xpub;
