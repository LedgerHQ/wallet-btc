import * as bitcoin from 'bitcoinjs-lib';
import Btc from '@ledgerhq/hw-app-btc';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { BufferWriter } from 'bitcoinjs-lib/src/bufferutils';
import { Transaction } from '@ledgerhq/hw-app-btc/lib/types';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import coininfo from 'coininfo';
import { flatten } from 'lodash';
import BigNumber from 'bignumber.js';
import Xpub from './xpub';
import LedgerExplorer from './explorer/ledgerexplorer';
import Bitcoin from './crypto/bitcoin';
import Mock from './storage/mock';
import { IExplorer } from './explorer/types';
import { IStorage, TX } from './storage/types';
import * as utils from './utils';
import PickingStrategy from './pickingstrategies/types';

export interface Account {
  params: {
    path: string;
    index: string;
    network: 'mainnet' | 'testnet';
    derivationMode: 'Legacy' | 'SegWit' | 'Native SegWit';
    explorer: 'ledgerv3' | 'ledgerv2';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    explorerURI: string;
    storage: 'mock';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storageParams: any[];
  };

  xpub: Xpub;
}

export interface SerializedAccount {
  params: {
    path: string;
    index: string;
    network: 'mainnet' | 'testnet';
    derivationMode: 'Legacy' | 'SegWit' | 'Native SegWit';
    explorer: 'ledgerv3' | 'ledgerv2';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    explorerURI: string;
    storage: 'mock';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storageParams: any[];
  };

  xpub: {
    xpub: string;
    txs: TX[];
  };
}

class WalletLedger {
  explorerInstances: { [key: string]: IExplorer } = {};

  networks: { [key: string]: bitcoin.Network } = {
    mainnet: coininfo.bitcoin.main.toBitcoinJS(),
    testnet: coininfo.bitcoin.test.toBitcoinJS(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  explorers: { [key: string]: (explorerURI: string) => IExplorer } = {
    ledgerv3: (explorerURI) =>
      new LedgerExplorer({
        explorerURI,
        explorerVersion: 'v3',
      }),
    ledgerv2: (explorerURI) =>
      new LedgerExplorer({
        explorerURI,
        explorerVersion: 'v2',
      }),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accountStorages: { [key: string]: (...args: any[]) => IStorage } = {
    mock: () => new Mock(),
  };

  getExplorer(explorer: 'ledgerv3' | 'ledgerv2', explorerURI: string) {
    const id = `explorer-${explorer}-uri-${explorerURI}`;
    this.explorerInstances[id] = this.explorerInstances[id] || this.explorers[explorer](explorerURI);
    return this.explorerInstances[id];
  }

  async generateAccount(params: {
    xpub?: string;
    btc?: Btc;
    path: string;
    index: string;
    network: 'mainnet' | 'testnet';
    derivationMode: 'Legacy' | 'SegWit' | 'Native SegWit';
    explorer: 'ledgerv3' | 'ledgerv2';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    explorerURI: string;
    storage: 'mock';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storageParams: any[];
  }): Promise<Account> {
    const network = this.networks[params.network];
    let { xpub } = params;

    // TODO Better use of TypeScript to avoid these conditions
    if (!xpub) {
      // Xpub not provided, generate it using the hwapp

      if (!params.btc) {
        // hwapp not provided
        throw new Error('generateAccount need either a hwapp or xpub');
      }

      const parentDerivation = await params.btc.getWalletPublicKey(`${params.path}`);
      const accountDerivation = await params.btc.getWalletPublicKey(`${params.path}/${params.index}'`);

      // parent
      const publicKeyParentCompressed = utils.compressPublicKey(parentDerivation.publicKey);
      const publicKeyParentCompressedHex = utils.parseHexString(publicKeyParentCompressed);
      let result = bitcoin.crypto.sha256(Buffer.from(publicKeyParentCompressedHex));
      result = bitcoin.crypto.ripemd160(result);
      // eslint-disable-next-line no-bitwise
      const fingerprint = ((result[0] << 24) | (result[1] << 16) | (result[2] << 8) | result[3]) >>> 0;

      // account
      const publicKeyAccountCompressed = utils.compressPublicKey(accountDerivation.publicKey);
      // eslint-disable-next-line no-bitwise
      const childnum = (0x80000000 | parseInt(params.index, 10)) >>> 0;

      const xpubRaw = utils.createXPUB(
        3,
        fingerprint,
        childnum,
        accountDerivation.chainCode,
        publicKeyAccountCompressed,
        network.bip32.public
      );
      xpub = utils.encodeBase58Check(xpubRaw);
    }

    const storage = this.accountStorages[params.storage](...params.storageParams);
    const explorer = this.getExplorer(params.explorer, params.explorerURI);

    return {
      params,
      xpub: new Xpub({
        storage,
        explorer,
        crypto: new Bitcoin({ network }),
        xpub,
        derivationMode: params.derivationMode,
      }),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  async syncAccount(account: Account) {
    return account.xpub.sync();
  }

  // eslint-disable-next-line class-methods-use-this
  async getAccountNewReceiveAddress(account: Account) {
    const address = await account.xpub.getNewAddress(0, 1);
    return address;
  }

  // eslint-disable-next-line class-methods-use-this
  async getAccountNewChangeAddress(account: Account) {
    const address = await account.xpub.getNewAddress(1, 1);
    return address;
  }

  // eslint-disable-next-line class-methods-use-this
  async getAccountTransactions(account: Account) {
    const txs = await account.xpub.storage.export();
    return txs;
  }

  // eslint-disable-next-line class-methods-use-this
  async getAccountUnspentUtxos(account: Account) {
    const addresses = await account.xpub.getXpubAddresses();
    return flatten(await Promise.all(addresses.map((address) => account.xpub.storage.getAddressUnspentUtxos(address))));
  }

  // eslint-disable-next-line class-methods-use-this
  async getAccountBalance(account: Account) {
    const balance = await account.xpub.getXpubBalance();
    return balance;
  }

  // eslint-disable-next-line class-methods-use-this
  async getAccountPendings(account: Account) {
    const addresses = await account.xpub.getXpubAddresses();
    return flatten(await Promise.all(addresses.map((address) => account.xpub.explorer.getPendings(address))));
  }

  // eslint-disable-next-line class-methods-use-this
  async buildAccountTx(params: {
    fromAccount: Account;
    dest: string;
    amount: BigNumber;
    feePerByte: number;
    utxoPickingStrategy: PickingStrategy;
    sequence?: number;
  }) {
    const changeAddress = await params.fromAccount.xpub.getNewAddress(1, 1);
    const txinfos = await params.fromAccount.xpub.buildTx({
      destAddress: params.dest,
      amount: params.amount,
      feePerByte: params.feePerByte,
      changeAddress: changeAddress.address,
      utxoPickingStrategy: params.utxoPickingStrategy,
      sequence: params.sequence,
    });
    return txinfos;
  }

  // eslint-disable-next-line class-methods-use-this
  async signAccounTx(
    btc: Btc,
    fromAccount: Account,
    txinfos: {
      inputs: [string, number, null, number | null][];
      associatedDerivations: [number, number][];
      outputs: {
        script: Buffer;
        value: BigNumber;
      }[];
    }
  ) {
    const length = txinfos.outputs.reduce((sum, output) => {
      return sum + 8 + output.script.length + 1;
    }, 1);
    const buffer = Buffer.allocUnsafe(length);
    const bufferWriter = new BufferWriter(buffer, 0);
    bufferWriter.writeVarInt(txinfos.outputs.length);
    txinfos.outputs.forEach((txOut) => {
      // xpub splits output into smaller outputs than SAFE_MAX_INT anyway
      bufferWriter.writeUInt64(txOut.value.toNumber());
      bufferWriter.writeVarSlice(txOut.script);
    });
    const outputScriptHex = buffer.toString('hex');

    const associatedKeysets = txinfos.associatedDerivations.map(
      ([account, index]) => `${fromAccount.params.path}/${fromAccount.params.index}'/${account}/${index}`
    );
    type Inputs = [Transaction, number, string | null | undefined, number | null | undefined][];
    const inputs: Inputs = txinfos.inputs.map(([txHex, index]) => [
      btc.splitTransaction(txHex, true),
      index,
      null,
      null,
    ]);

    const tx = await btc.createPaymentTransactionNew({
      inputs,
      associatedKeysets,
      outputScriptHex,
      // changePath: `${fromAccount.params.path}/${fromAccount.params.index}'/${changeAddress.account}/${changeAddress.index}`,
      additionals: [],
    });

    return tx;
  }

  // eslint-disable-next-line class-methods-use-this
  async broadcastTx(fromAccount: Account, tx: string) {
    const res = await fromAccount.xpub.broadcastTx(tx);
    return res.data.result;
  }

  // eslint-disable-next-line class-methods-use-this
  exportToSerializedAccount(account: Account): SerializedAccount {
    const txs = account.xpub.storage.export();

    return {
      ...account,
      xpub: {
        xpub: account.xpub.xpub,
        txs,
      },
    };
  }

  importFromSerializedAccount(account: SerializedAccount): Account {
    const network = this.networks[account.params.network];
    const storage = this.accountStorages[account.params.storage](...account.params.storageParams);
    const explorer = this.getExplorer(account.params.explorer, account.params.explorerURI);

    const xpub = new Xpub({
      storage,
      explorer,
      crypto: new Bitcoin({ network }),
      xpub: account.xpub.xpub,
      derivationMode: account.params.derivationMode,
    });

    xpub.storage.load(account.xpub.txs);

    return {
      ...account,
      xpub,
    };
  }
}

export default WalletLedger;
