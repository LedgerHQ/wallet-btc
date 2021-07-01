import { findLast, filter, uniqBy, findIndex } from 'lodash';
import { Input, IStorage, Output, TX, Address } from './types';

// a mock storage class that just use js objects
// sql.js would be perfect for the job
class Mock implements IStorage {
  txs: TX[] = [];

  // indexes
  primaryIndex: { [key: string]: TX } = {};

  // accounting
  unspentUtxos: { [key: string]: Output[] } = {};

  // only needed to handle the case when the input
  // is seen before the output (typically explorer
  // returning unordered tx within the same block)
  spentUtxos: { [key: string]: Input[] } = {};

  async getLastTx(txFilter: { account?: number; index?: number }) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const tx: TX | undefined = findLast(this.txs, txFilter);
    return tx;
  }

  async getTx(address: string, id: string) {
    const index = `${address}-${id}`;
    return this.primaryIndex[index];
  }

  // TODO: only expose unspentUtxos
  async getAddressUnspentUtxos(address: Address) {
    const indexAddress = address.address;
    return this.unspentUtxos[indexAddress];
  }

  async appendTxs(txs: TX[]) {
    const lastLength = this.txs.length;

    txs.forEach((tx) => {
      const indexAddress = tx.address;
      const index = `${indexAddress}-${tx.id}`;

      // we reject already seen tx and tx pendings
      if (this.primaryIndex[index] || !tx.block) {
        return;
      }

      this.primaryIndex[index] = tx;
      this.unspentUtxos[indexAddress] = this.unspentUtxos[indexAddress] || [];
      this.spentUtxos[indexAddress] = this.spentUtxos[indexAddress] || [];
      this.txs.push(tx);

      tx.outputs.forEach((output) => {
        if (output.address === tx.address) {
          this.unspentUtxos[indexAddress].push(output);
        }
      });

      tx.inputs.forEach((input) => {
        if (input.address === tx.address) {
          this.spentUtxos[indexAddress].push(input);
        }
      });

      this.unspentUtxos[indexAddress] = this.unspentUtxos[indexAddress].filter((output) => {
        const matchIndex = findIndex(
          this.spentUtxos[indexAddress],
          (input: Input) => input.output_hash === output.output_hash && input.output_index === output.output_index
        );
        if (matchIndex > -1) {
          this.spentUtxos[indexAddress].splice(matchIndex, 1);
          return false;
        }
        return true;
      });
    });

    return this.txs.length - lastLength;
  }

  async getUniquesAddresses(addressesFilter: { account?: number; index?: number }) {
    // TODO: to speed up, create more useful indexes in appendTxs
    return uniqBy(
      filter(this.txs, addressesFilter).map((tx: TX) => ({
        address: tx.address,
        account: tx.account,
        index: tx.index,
      })),
      'address'
    );
  }

  async export() {
    return this.txs;
  }

  async load(txs: TX[]) {
    await this.appendTxs(txs);
  }
}

export default Mock;
