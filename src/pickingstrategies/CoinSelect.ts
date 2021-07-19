import BigNumber from 'bignumber.js';
import { flatten, sortBy } from 'lodash';
import { Output } from '../storage/types';
import Xpub from '../xpub';
import { IPickingStrategy } from './types';

// refer to https://bitcoin.stackexchange.com/questions/1077/what-is-the-coin-selection-algorithm
class CoinSelect implements IPickingStrategy {
  // eslint-disable-next-line class-methods-use-this
  async selectUnspentUtxosToUse(xpub: Xpub, amount: BigNumber, feePerByte: number, nbOutputsWithoutChange: number) {
    // get the utxos to use as input
    // from all addresses of the account
    const addresses = await xpub.getXpubAddresses();
    let unspentUtxos = flatten(
      await Promise.all(addresses.map((address) => xpub.storage.getAddressUnspentUtxos(address)))
    );
    unspentUtxos = sortBy(unspentUtxos, 'value');

    const bytes = 10 + (nbOutputsWithoutChange + 1) * 34;
    let fee = bytes * feePerByte;
    const outputFee = fee;
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

    let bestUtxo = unspentUtxoSelected;
    let bestTotal = total;
    let range = 0;
    for (let i=0; i < unspentUtxos.length; i++){
      const singleUtxoValue = new BigNumber(Number(unspentUtxos[i].value));
      // try to pick only one input utxo, check whether the utxo is enough for the transaction
      if (singleUtxoValue.gte(amount.plus(outputFee).plus(180 * feePerByte))) {
        // check whether it is better than the merge output strategy
        if (bestTotal.gt(singleUtxoValue)) {
          bestTotal = singleUtxoValue;
          const unspentUtxoSelected: Output[] = [unspentUtxos[i]];
          bestUtxo = unspentUtxoSelected;
          range = i;
          fee = outputFee + 180 * feePerByte;
          break;
        }
      }
    }
    if (range > 0){
      // refer to https://github.com/bitcoin/bitcoin/blob/3015e0bca6bc2cb8beb747873fdf7b80e74d679f/src/wallet.cpp#L1129 for 1000 iteration to get the best coin select
      for (let step=0; step<1000; step++){
        const unspentUtxoSelected: Output[] = [];
        let total = new BigNumber(0);
        let nbInput = 0;
        for (let i=0; i<range; i++){
          if (Math.random()<0.5){
            unspentUtxoSelected.push(unspentUtxos[i]);
            nbInput++;
            total = total.plus(unspentUtxos[i].value);
          }
        }
        if (total.gt(amount.plus(outputFee).plus(nbInput * 180 * feePerByte))){
          if (bestTotal.gt(total)) {
            bestTotal = total;
            bestUtxo = unspentUtxoSelected;
            fee = outputFee + nbInput * 180 * feePerByte;
          }
        }
      }
    }

    return {
      totalValue: total,
      unspentUtxos: bestUtxo,
      fee,
    };
  }
}

export default CoinSelect;
