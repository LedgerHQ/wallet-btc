import BigNumber from 'bignumber.js';
import { flatten, sortBy } from 'lodash';
import { Output } from '../storage/types';
import Xpub from '../xpub';
import { IPickingStrategy } from './types';

class DeepFirst implements IPickingStrategy {
  // eslint-disable-next-line class-methods-use-this
  async selectUnspentUtxosToUse(xpub: Xpub, amount: BigNumber, feePerByte: number, nbOutputsWithoutChange: number) {
    // get the utxos to use as input
    // from all addresses of the account
    const addresses = await xpub.getXpubAddresses();
    let unspentUtxos = flatten(
      await Promise.all(addresses.map((address) => xpub.storage.getAddressUnspentUtxos(address)))
    );
    unspentUtxos = sortBy(unspentUtxos, 'block_height');
    // https://metamug.com/article/security/bitcoin-transaction-fee-satoshi-per-byte.html
    // easy way, we consider inputs are not compressed
    // and that we have extras
    const bytes = 10 + (nbOutputsWithoutChange + 1) * 34;
    let fee = bytes * feePerByte;

    let total = new BigNumber(0);
    const unspentUtxoSelected: Output[] = [];

    let i = 0;
    while (total.lt(amount.plus(fee))) {
      if (!unspentUtxos[i]) {
        throw new Error('amount bigger than the total balance');
      }
      total = total.plus(unspentUtxos[i].value);
      unspentUtxoSelected.push(unspentUtxos[i]);
      fee += 180 * feePerByte;
      i += 1;
    }

    return {
      totalValue: total,
      unspentUtxos: unspentUtxoSelected,
      fee,
    };
  }
}

export default DeepFirst;
