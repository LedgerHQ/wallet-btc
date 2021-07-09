import BigNumber from 'bignumber.js';
import { Output } from '../storage/types';
import Xpub from '../xpub';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IPickingStrategy {
  selectUnspentUtxosToUse(
    xpub: Xpub,
    amount: BigNumber,
    fee: number
  ): Promise<{
    unspentUtxos: Output[];
    totalValue: BigNumber;
  }>;
}
