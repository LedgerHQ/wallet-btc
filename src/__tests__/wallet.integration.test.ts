import BigNumber from 'bignumber.js';
import WalletLedger from '../wallet';
import { Account } from '../account';
import { Merge } from '../pickingstrategies/Merge';
import MockBtc from './mocks/Btc';
import LedgerExplorer from '../explorer/ledgerexplorer';
import { IExplorer } from '../explorer/types';

describe('testing wallet', () => {
  const explorerInstances: { [key: string]: IExplorer } = {
    'explorer-ledgerv3-explorer-https://explorers.api.vault.ledger.com/blockchain/v3/btc': new LedgerExplorer({
      explorerURI: 'https://explorers.api.vault.ledger.com/blockchain/v3/btc',
      explorerVersion: 'v3',
    }),
  };
  const wallet = new WalletLedger({
    getExplorer: (explorer, explorerURI) => {
      const id = `explorer-${explorer}-uri-${explorerURI}`;
      return explorerInstances[id];
    },
  });
  let account: Account;
  it('should generate an account', async () => {
    account = await wallet.generateAccount({
      btc: new MockBtc(),
      path: "44'/0'",
      index: 0,
      network: 'mainnet',
      derivationMode: 'Legacy',
      explorer: 'ledgerv3',
      explorerURI: 'https://explorers.api.vault.ledger.com/blockchain/v3/btc',
      storage: 'mock',
      storageParams: [],
    });

    expect(account.xpub.xpub).toEqual(
      'xpub6CV2NfQJYxHn7MbSQjQip3JMjTZGUbeoKz5xqkBftSZZPc7ssVPdjKrgh6N8U1zoQDxtSo6jLarYAQahpd35SJoUKokfqf1DZgdJWZhSMqP'
    );
  });

  it('should sync an account', async () => {
    await wallet.syncAccount(account);
    const balance = await wallet.getAccountBalance(account);

    expect(balance.toNumber()).toEqual(109088);
  }, 60000);

  it('should allow to store and load an account', async () => {
    const serializedAccount = await wallet.exportToSerializedAccount(account);
    const unserializedAccount = await wallet.importFromSerializedAccount(serializedAccount);
    const balance = await wallet.getAccountBalance(unserializedAccount);
    expect(balance.toNumber()).toEqual(109088);
  });

  it('should allow to build a transaction', async () => {
    const receiveAddress = await wallet.getAccountNewReceiveAddress(account);
    const utxoPickingStrategy = new Merge(account.xpub.crypto, account.xpub.derivationMode, []);
    const txInfo = await wallet.buildAccountTx({
      fromAccount: account,
      dest: receiveAddress.address,
      amount: new BigNumber(100000),
      feePerByte: 5,
      utxoPickingStrategy,
    });
    const tx = await wallet.signAccountTx({
      btc: new MockBtc(),
      fromAccount: account,
      txInfo,
    });
    expect(tx).toEqual('1f278baad1824d5d0a1acc06fa3812fc08ba78a0');
  });

  it('should allow to build a transaction splitting outputs', async () => {
    const receiveAddress = await wallet.getAccountNewReceiveAddress(account);
    account.xpub.OUTPUT_VALUE_MAX = 60000;
    const utxoPickingStrategy = new Merge(account.xpub.crypto, account.xpub.derivationMode, []);
    const txInfo = await wallet.buildAccountTx({
      fromAccount: account,
      dest: receiveAddress.address,
      amount: new BigNumber(100000),
      feePerByte: 5,
      utxoPickingStrategy,
    });
    const tx = await wallet.signAccountTx({
      btc: new MockBtc(),
      fromAccount: account,
      txInfo,
    });
    expect(tx).toEqual('3ff8f90f08e1f0a3628ca1af1619d4a1a41a2107');
  });
});
