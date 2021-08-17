import BigNumber from 'bignumber.js';
import { flatten, sortBy } from 'lodash';
import { Output } from '../storage/types';
import Xpub from '../xpub';
import PickingStrategy from './types';
import * as utils from '../utils';

class Merge extends PickingStrategy {
  // eslint-disable-next-line class-methods-use-this
  async selectUnspentUtxosToUse(xpub: Xpub, amount: BigNumber, feePerByte: number, nbOutputsWithoutChange: number) {
    // get the utxos to use as input
    // from all addresses of the account
    const addresses = await xpub.getXpubAddresses();
    let unspentUtxos = flatten(
      await Promise.all(addresses.map((address) => xpub.storage.getAddressUnspentUtxos(address)))
    );
    const sizePerInput =
      utils.estimateTxSize(1, 0, this.crypto, this.derivationMode) -
      utils.estimateTxSize(0, 0, this.crypto, this.derivationMode);

    unspentUtxos = sortBy(unspentUtxos, 'value');
    // https://metamug.com/article/security/bitcoin-transaction-fee-satoshi-per-byte.html
    const txSizeNoInput = utils.estimateTxSize(0, nbOutputsWithoutChange + 1, this.crypto, this.derivationMode);
    let fee = txSizeNoInput * feePerByte;

    let total = new BigNumber(0);
    const unspentUtxoSelected: Output[] = [];

    let i = 0;
    while (total.lt(amount.plus(fee))) {
      if (!unspentUtxos[i]) {
        throw new Error('amount bigger than the total balance');
      }
      total = total.plus(unspentUtxos[i].value);
      unspentUtxoSelected.push(unspentUtxos[i]);
      fee += sizePerInput * feePerByte;
      i += 1;
    }

    return {
      totalValue: total,
      unspentUtxos: unspentUtxoSelected,
      fee,
      needChangeoutput: true,
    };
  }
}

export default Merge;
