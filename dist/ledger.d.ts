import * as bitcoin from 'bitcoinjs-lib';
import Btc from '@ledgerhq/hw-app-btc';
import Xpub from './xpub';
import { IExplorer } from './explorer/types';
import { IStorage, Output, TX } from './storage/types';
export interface Account {
    params: {
        path: string;
        index: string;
        network: 'mainnet' | 'testnet';
        derivationMode: 'Legacy' | 'SegWit' | 'Native SegWit';
        explorer: 'ledgerv3';
        explorerParams: any[];
        storage: 'mock';
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
        explorer: 'ledgerv3';
        explorerParams: any[];
        storage: 'mock';
        storageParams: any[];
    };
    xpub: {
        xpub: string;
        txs: TX[];
    };
}
declare class WalletLedger {
    btc: Btc;
    networks: {
        [key: string]: bitcoin.Network;
    };
    explorers: {
        [key: string]: (...args: any[]) => IExplorer;
    };
    accountStorages: {
        [key: string]: (...args: any[]) => IStorage;
    };
    constructor(btc: Btc);
    generateAccount(params: {
        path: string;
        index: string;
        network: 'mainnet' | 'testnet';
        derivationMode: 'Legacy' | 'SegWit' | 'Native SegWit';
        explorer: 'ledgerv3';
        explorerParams: any[];
        storage: 'mock';
        storageParams: any[];
    }): Promise<Account>;
    exportToSerializedAccount(account: Account): Promise<SerializedAccount>;
    importFromSerializedAccount(account: SerializedAccount): Promise<Account>;
    syncAccount(account: Account): Promise<number>;
    getAccountNewReceiveAddress(account: Account): Promise<import("./storage/types").Address>;
    getAccountNewChangeAddress(account: Account): Promise<import("./storage/types").Address>;
    getAccountOperations(account: Account): Promise<TX[]>;
    getAccountUnspentUtxos(account: Account): Promise<Output[]>;
    getAccountBalance(account: Account): Promise<number>;
    getAccountPendings(account: Account): Promise<TX[]>;
    buildAccountTx(fromAccount: Account, dest: string, amount: number, fee: number, unspentUtxoSelected?: Output[]): Promise<string>;
    broadcastTx(fromAccount: Account, tx: string): Promise<any>;
}
export default WalletLedger;
