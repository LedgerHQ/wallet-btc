import BigNumber from 'bignumber.js';
import { ICrypto } from '../crypto/types';
import { Output } from '../storage/types';
// eslint-disable-next-line import/no-cycle
import Xpub from '../xpub';

// eslint-disable-next-line import/prefer-default-export
export abstract class PickingStrategy {
  crypto: ICrypto;

  derivationMode: string;

  constructor(crypto: ICrypto, derivationMode: string) {
    this.crypto = crypto;
    this.derivationMode = derivationMode;
  }

  abstract selectUnspentUtxosToUse(
    xpub: Xpub,
    amount: BigNumber,
    feePerByte: number,
    nbOutputsWithoutChange: number
  ): Promise<{
    unspentUtxos: Output[];
    totalValue: BigNumber;
    fee: number;
    needChangeoutput: boolean;
  }>;
}
