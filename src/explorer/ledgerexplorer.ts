import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import * as https from 'https';

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import JSONBigNumber from '@ledgerhq/json-bignumber';
import { log } from '@ledgerhq/logs';
import BigNumber from 'bignumber.js';
import { Address, Block, TX } from '../storage/types';
import EventEmitter from '../utils/eventemitter';
import { IExplorer } from './types';

const { LOG } = process.env;

const requestInterceptor = (request: AxiosRequestConfig): AxiosRequestConfig => {
  const { baseURL, url, method = '', data } = request;
  log('network', `${method} ${baseURL}${url}`, data);
  if (LOG && LOG === 'http') {
    // eslint-disable-next-line no-console
    console.log(`${method} ${baseURL}${url}`, data);
  }
  return request;
};

const responseInterceptor = (
  response: {
    config: AxiosRequestConfig;
  } & AxiosResponse
) => {
  const { baseURL, url, method = '' } = response?.config;
  log(
    'network-success',
    `${response.status} ${method} ${baseURL}${url}`,
    response.data ? { data: response.data } : undefined
  );
  if (LOG && LOG === 'http') {
    // eslint-disable-next-line no-console
    console.log(`${response.status} ${method} ${baseURL}${url}`, response.data ? { data: response.data } : undefined);
  }
  return response;
};

class LedgerExplorer extends EventEmitter implements IExplorer {
  client: AxiosInstance;

  disableBatchSize = false;

  explorerVersion: 'v2' | 'v3';

  constructor({
    explorerURI,
    explorerVersion,
    disableBatchSize,
  }: {
    explorerURI: string;
    explorerVersion: 'v2' | 'v3';
    disableBatchSize?: boolean;
  }) {
    super();

    this.client = axios.create({
      baseURL: explorerURI,
      // uses max 20 keep alive request in parallel
      httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 20 }),
    });
    // 3 retries per request
    axiosRetry(this.client, { retries: 3 });
    this.explorerVersion = explorerVersion;
    if (disableBatchSize) {
      this.disableBatchSize = disableBatchSize;
    }

    // Logging
    this.client.interceptors.request.use(requestInterceptor);
    this.client.interceptors.response.use(responseInterceptor);
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

    this.emit('fetched-transaction-tx', { url, tx: res[0] });

    return res[0].hex;
  }

  async getCurrentBlock() {
    const url = `/blocks/current`;

    this.emit('fetching-block', { url });

    const res = (await this.client.get(url)).data;

    this.emit('fetched-block', { url, block: res });

    if (!res) {
      return null;
    }

    const block: Block = {
      height: res.height,
      hash: res.hash,
      time: res.time,
    };

    return block;
  }

  async getBlockByHeight(height: number) {
    const url = `/blocks/${height}`;

    this.emit('fetching-block', { url, height });

    const res = (await this.client.get(url)).data;

    this.emit('fetched-block', { url, block: res[0] });

    if (!res[0]) {
      return null;
    }

    const block: Block = {
      height: res[0].height,
      hash: res[0].hash,
      time: res[0].time,
    };

    return block;
  }

  async getFees() {
    const url = `/fees`;

    this.emit('fetching-fees', { url });

    // TODO add a test for failure (at the sync level)
    const fees = (await this.client.get(url)).data;

    this.emit('fetching-fees', { url, fees });

    return fees;
  }

  async getPendings(address: Address, nbMax?: number) {
    const pendingsTxs = await this.getAddressTxsSinceLastTxBlock(nbMax || 1000, address, undefined);
    // const pendingsTxs = txs.filter((tx) => !tx.block);
    console.log(pendingsTxs);
    pendingsTxs.forEach((tx) => this.hydrateTx(address, tx));
    return pendingsTxs;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async fetchTxs(address: Address, params: any) {
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

    this.emit('fetched-address-transaction', { url, params, res });

    return res;
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-explicit-any
  hydrateTx(address: Address, tx: TX) {
    // no need to keep those as they change
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    // eslint-disable-next-line no-param-reassign
    delete tx.confirmations;
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    // eslint-disable-next-line no-param-reassign
    delete tx.received_at;
    // eslint-disable-next-line no-param-reassign
    tx.account = address.account;
    // eslint-disable-next-line no-param-reassign
    tx.index = address.index;
    // eslint-disable-next-line no-param-reassign
    tx.address = address.address;

    tx.outputs.forEach((output) => {
      // eslint-disable-next-line @typescript-eslint/camelcase,no-param-reassign
      output.output_hash = tx.hash;
      // eslint-disable-next-line @typescript-eslint/camelcase,no-param-reassign
      output.block_height = tx.block ? tx.block.height : null;
    });
  }

  async getAddressTxsSinceLastTxBlock(batchSize: number, address: Address, lastTx: TX | undefined) {
    const params: {
      no_token?: string;
      noToken?: string;
      batch_size?: number;
      block_hash?: string;
      blockHash?: string;
    } =
      this.explorerVersion === 'v2'
        ? {
            noToken: 'true',
          }
        : {
            // eslint-disable-next-line @typescript-eslint/camelcase
            no_token: 'true',
          };
    if (!this.disableBatchSize) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      params.batch_size = batchSize;
    }
    if (lastTx) {
      if (this.explorerVersion === 'v2') {
        params.blockHash = lastTx.block.hash;
      } else {
        // eslint-disable-next-line @typescript-eslint/camelcase
        params.block_hash = lastTx.block.hash;
      }
    }

    const res = await this.fetchTxs(address, params);

    const hydratedTxs: TX[] = [];

    // faster than mapping
    res.txs.forEach((tx) => {
      if (!tx.block) {
        return;
      }

      this.hydrateTx(address, tx);

      hydratedTxs.push(tx);
    });

    return hydratedTxs;
  }
}

export default LedgerExplorer;
