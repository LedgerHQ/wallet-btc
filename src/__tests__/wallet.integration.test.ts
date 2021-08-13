import BigNumber from 'bignumber.js';
import WalletLedger, { Account } from '..';
import Merge from '../pickingstrategies/Merge';
import MockBtc from './mocks/Btc';

describe('testing wallet', () => {
  const wallet = new WalletLedger();
  let account: Account;
  it('should generate an account', async () => {
    account = await wallet.generateAccount({
      btc: new MockBtc(),
      path: "44'/0'",
      index: '0',
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
    const utxoPickingStrategy = new Merge(account.xpub.crypto, account.xpub.derivationMode);
    const { txinfos } = await wallet.buildAccountTx({
      fromAccount: account,
      dest: receiveAddress.address,
      amount: new BigNumber(100000),
      feePerByte: 5,
      utxoPickingStrategy,
    });
    const tx = await wallet.signAccounTx(new MockBtc(), account, txinfos);
    expect(tx).toEqual('02d5e970283203ed91da5e5e9bb125f2a490e189');
  });

  it('should allow to build a transaction splitting outputs', async () => {
    const receiveAddress = await wallet.getAccountNewReceiveAddress(account);
    account.xpub.OUTPUT_VALUE_MAX = 60000;
    const utxoPickingStrategy = new Merge(account.xpub.crypto, account.xpub.derivationMode);
    const { txinfos } = await wallet.buildAccountTx({
      fromAccount: account,
      dest: receiveAddress.address,
      amount: new BigNumber(100000),
      feePerByte: 5,
      utxoPickingStrategy,
    });
    const tx = await wallet.signAccounTx(new MockBtc(), account, txinfos);
    expect(tx).toEqual('2ff622550c58695764bd942a8054649c167b28c6');
  });
});
