import { Input, IStorage, Output, TX, Address } from './types';
declare class Mock implements IStorage {
    txs: TX[];
    primaryIndex: {
        [key: string]: TX;
    };
    unspentUtxos: {
        [key: string]: Output[];
    };
    spentUtxos: {
        [key: string]: Input[];
    };
    getLastTx(txFilter: {
        account?: number;
        index?: number;
    }): Promise<TX>;
    getTx(address: string, id: string): Promise<TX>;
    getAddressUnspentUtxos(address: Address): Promise<Output[]>;
    appendTxs(txs: TX[]): Promise<number>;
    getUniquesAddresses(addressesFilter: {
        account?: number;
        index?: number;
    }): Promise<{
        address: string;
        account: number;
        index: number;
    }[]>;
    export(): Promise<TX[]>;
    load(txs: TX[]): Promise<void>;
}
export default Mock;
