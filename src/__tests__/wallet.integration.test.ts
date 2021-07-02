import WalletLedger, { Account } from '..';
import MockBtc from './mocks/Btc';

const describeToUse = process.env.CI ? describe.skip : describe;

describeToUse('testing wallet', () => {
  const wallet = new WalletLedger(new MockBtc());
  let account: Account;
  it('should generate an account', async () => {
    account = await wallet.generateAccount({
      path: "44'/0'",
      index: '0',
      network: 'mainnet',
      derivationMode: 'Legacy',
      explorer: 'ledgerv3',
      explorerParams: ['https://explorers.api.vault.ledger.com/blockchain/v3/btc'],
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

    expect(balance).toEqual(111299);
  });

  it('should allow to store and load an account', async () => {
    const serializedAccount = await wallet.exportToSerializedAccount(account);
    const unserializedAccount = await wallet.importFromSerializedAccount(serializedAccount);
    const balance = await wallet.getAccountBalance(unserializedAccount);
    expect(balance).toEqual(111299);
  });

  it('should allow to build a transaction', async () => {
    const receiveAddress = await wallet.getAccountNewReceiveAddress(account);
    const tx = await wallet.buildAccountTx(account, receiveAddress.address, 100000, 1000);
    expect(tx).toEqual('004ab82add183c2dad9d38f492f977e71c83056c');
  });
});
