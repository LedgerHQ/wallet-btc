import BigNumber from 'bignumber.js';
import { Output } from '../storage/types';
// eslint-disable-next-line import/no-cycle
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
