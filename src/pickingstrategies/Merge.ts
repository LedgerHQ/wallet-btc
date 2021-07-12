import BigNumber from 'bignumber.js';
import { flatten, sortBy } from 'lodash';
import { Output } from '../storage/types';
import Xpub from '../xpub';
import { IPickingStrategy } from './types';

// an Live explorer V3 class
class Merge implements IPickingStrategy {
  // eslint-disable-next-line class-methods-use-this
  async selectUnspentUtxosToUse(xpub: Xpub, amount: BigNumber, fee: number) {
    // get the utxos to use as input
    // from all addresses of the account
    const addresses = await xpub.getXpubAddresses();
    let unspentUtxos = flatten(
      await Promise.all(addresses.map((address) => xpub.storage.getAddressUnspentUtxos(address)))
    );
    unspentUtxos = sortBy(unspentUtxos, 'value');

    let total = new BigNumber(0);
    const unspentUtxoSelected: Output[] = [];

    let i = 0;
    while (total.lt(amount.plus(fee))) {
      if (!unspentUtxos[i]) {
        throw new Error('amount bigger than the total balance');
      }
      total = total.plus(unspentUtxos[i].value);
      unspentUtxoSelected.push(unspentUtxos[i]);
      i += 1;
    }

    return {
      totalValue: total,
      unspentUtxos: unspentUtxoSelected,
    };
  }
}

export default Merge;
