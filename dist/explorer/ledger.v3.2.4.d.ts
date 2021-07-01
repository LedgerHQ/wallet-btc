import { AxiosInstance } from 'axios';
import { Address, TX } from '../storage/types';
import EventEmitter from '../utils/eventemitter';
import { IExplorer } from './types';
declare class LedgerV3Dot2Dot4 extends EventEmitter implements IExplorer {
    client: AxiosInstance;
    disableBatchSize: boolean;
    constructor({ explorerURI, disableBatchSize }: {
        explorerURI: string;
        disableBatchSize?: boolean;
    });
    broadcast(tx: string): Promise<import("axios").AxiosResponse<any>>;
    getTxHex(txId: string): Promise<any>;
    getPendings(address: Address, nbMax?: number): Promise<TX[]>;
    getAddressTxsSinceLastTxBlock(batchSize: number, address: Address, lastTx: TX | undefined): Promise<TX[]>;
}
export default LedgerV3Dot2Dot4;
