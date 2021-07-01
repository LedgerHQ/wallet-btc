export interface TX {
  id: string;
  account: number;
  index: number;
  block: Block;
  address: string;
  inputs: Input[];
  outputs: Output[];
}

export interface Input {
  value: number;
  address: string;
  output_hash: string;
  output_index: number;
}

export interface Output {
  value: number;
  address: string;
  output_hash: string;
  output_index: number;
  script_hex: string;
}

export interface Block {
  height: number;
  hash: string;
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
  getLastTx(txFilter: { account?: number; index?: number }): Promise<TX | undefined>;
  getTx(address: string, id: string): Promise<TX | undefined>;
  getUniquesAddresses(addressesFilter: { account?: number; index?: number }): Promise<Address[]>;
  export(): Promise<TX[]>;
  load(tx: TX[]): Promise<void>;
}
