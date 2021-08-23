export interface TX {
  hash: string;
  account: number;
  index: number;
  block: Block;
  address: string;
  inputs: Input[];
  outputs: Output[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fees?: any;
}

export interface Input {
  value: string;
  address: string;
  output_hash: string;
  output_index: number;
  sequence: number;
}

export interface Output {
  value: string;
  address: string;
  output_hash: string;
  output_index: number;
  script_hex: string;
  block_height: number | null;
}

export interface Block {
  height: number;
  hash: string;
  time: string;
}

export interface Address {
  account: number;
  index: number;
  address: string;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IStorage {
  appendTxs(txs: TX[]): Promise<number>;
  getAddressUnspentUtxos(address: Address): Promise<Output[]>;
  getLastTx(txFilter: { account?: number; index?: number; address?: string }): Promise<TX | undefined>;
  getTx(address: string, hash: string): Promise<TX | undefined>;
  getUniquesAddresses(addressesFilter: { account?: number; index?: number }): Promise<Address[]>;
  removeTxs(txsFilter: { account: number; index: number }): Promise<void>;
  export(): Promise<unknown>;
  load(data: unknown): Promise<void>;
}
