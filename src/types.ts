import BigNumber from 'bignumber.js';
import { Input } from './storage/types';

export type InputInfo = Input & { txHex: string };

export type OutputInfo = {
  script: Buffer;
  value: BigNumber;
  address: string;
  isChange: boolean;
};

// Used when building a transaction to sign and broadcast
export type TransactionInfo = {
  inputs: InputInfo[];
  associatedDerivations: [number, number][];
  outputs: OutputInfo[];
  fee: number;
};

export type BtcAppTransaction = {
  version: Buffer;
  inputs: {
    prevout: Buffer;
    script: Buffer;
    sequence: Buffer;
    tree?: Buffer;
  }[];
  outputs?: {
    amount: Buffer;
    script: Buffer;
  }[];
  locktime?: Buffer;
  witness?: Buffer;
  timestamp?: Buffer;
  nVersionGroupId?: Buffer;
  nExpiryHeight?: Buffer;
  extraData?: Buffer;
};

export type BtcAppCreateTransactionArg = {
  inputs: Array<[BtcAppTransaction, number, string | null | undefined, number | null | undefined]>;
  associatedKeysets: string[];
  changePath?: string;
  outputScriptHex: string;
  lockTime?: number;
  sigHashType?: number;
  segwit?: boolean;
  initialTimestamp?: number;
  additionals: Array<string>;
  expiryHeight?: Buffer;
  useTrustedInputForSegwit?: boolean;
};

export type BtcApp = {
  getWalletPublicKey(
    path: string,
    opts?: {
      verify?: boolean;
      format?: 'legacy' | 'p2sh' | 'bech32' | 'cashaddr';
    }
  ): Promise<{
    publicKey: string;
    bitcoinAddress: string;
    chainCode: string;
  }>;
  splitTransaction(
    transactionHex: string,
    isSegwitSupported?: boolean,
    hasTimestamp?: boolean,
    hasExtraData?: boolean,
    additionals?: string[]
  ): BtcAppTransaction;
  createPaymentTransactionNew(arg: BtcAppCreateTransactionArg): Promise<string>;
};
