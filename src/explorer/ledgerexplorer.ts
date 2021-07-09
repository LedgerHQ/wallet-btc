import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import * as https from 'https';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JSONBigNumber from 'json-bignumber';
import BigNumber from 'bignumber.js';
import { Address, TX } from '../storage/types';
import EventEmitter from '../utils/eventemitter';
import { IExplorer } from './types';

class LedgerExplorer extends EventEmitter implements IExplorer {
  client: AxiosInstance;

  disableBatchSize = false;

  public httpParams: { no_token?: string; noToken?: string; batch_size?: number; block_hash?: string } = {};

  constructor({ explorerURI, disableBatchSize }: { explorerURI: string; disableBatchSize?: boolean }) {
    super();

    this.client = axios.create({
      baseURL: explorerURI,
      // uses max 20 keep alive request in parallel
      httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 20 }),
    });
    // 3 retries per request
    axiosRetry(this.client, { retries: 3 });

    if (disableBatchSize) {
      this.disableBatchSize = disableBatchSize;
    }
  }

  async broadcast(tx: string) {
    const url = '/transactions/send';
    return this.client.post(url, { tx });
  }

  async getTxHex(txId: string) {
    const url = `/transactions/${txId}/hex`;

    this.emit('fetching-transaction-tx', { url, txId });

    // TODO add a test for failure (at the sync level)
    const res = (await this.client.get(url)).data;

    return res[0].hex;
  }

  async getPendings(address: Address, nbMax?: number) {
    const txs = await this.getAddressTxsSinceLastTxBlock(nbMax || 1000, address, undefined);
    return txs.filter((tx) => !tx.block);
  }

  async getAddressTxsSinceLastTxBlock(batchSize: number, address: Address, lastTx: TX | undefined) {
    const params = JSON.parse(JSON.stringify(this.httpParams));

    if (!this.disableBatchSize) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      params.batch_size = batchSize;
    }
    if (lastTx) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      params.block_hash = lastTx.block.hash;
    }

    const url = `/addresses/${address.address}/transactions`;

    this.emit('fetching-address-transaction', { url, params });

    // TODO add a test for failure (at the sync level)
    const res: { txs: TX[] } = (
      await this.client.get(url, {
        params,
        // some altcoin may have outputs with values > MAX_SAFE_INTEGER
        transformResponse: (string) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          JSONBigNumber.parse(string, (key: string, value: any) => {
            if (BigNumber.isBigNumber(value)) {
              if (key === 'value') {
                return value.toString();
              }

              return value.toNumber();
            }
            return value;
          }),        
      })
    ).data;

    // faster than mapping
    res.txs.forEach((tx) => {
      // no need to keep that as it changes
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      // eslint-disable-next-line no-param-reassign
      delete tx.confirmations;
      // eslint-disable-next-line no-param-reassign
      tx.account = address.account;
      // eslint-disable-next-line no-param-reassign
      tx.index = address.index;
      // eslint-disable-next-line no-param-reassign
      tx.address = address.address;

      tx.outputs.forEach((output) => {
        // eslint-disable-next-line @typescript-eslint/camelcase,no-param-reassign
        output.output_hash = tx.id;
      });
    });

    this.emit('fetched-address-transaction', { url, params, txs: res.txs });

    return res.txs;
  }
}

export default LedgerExplorer;
