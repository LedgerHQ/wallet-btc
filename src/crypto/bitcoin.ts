// from https://github.com/LedgerHQ/xpub-scan/blob/master/src/actions/deriveAddresses.ts

import * as bjs from 'bitcoinjs-lib';
import * as bip32 from 'bip32';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { toOutputScript } from 'bitcoinjs-lib/src/address';
import { DerivationModes } from '../types';
import { ICrypto, DerivationMode } from './types';

class Bitcoin implements ICrypto {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  network: any;

  derivationMode: DerivationMode = {
    LEGACY: DerivationModes.LEGACY,
    SEGWIT: DerivationModes.SEGWIT,
    NATIVE_SEGWIT: DerivationModes.NATIVE_SEGWIT,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor({ network }: { network: any }) {
    this.network = network;
    this.network.dustThreshold = 3000;
    this.network.dustPolicy = 'PER_KBYTE';
    this.network.usesTimestampedTransaction = false;
  }

  // derive legacy address at account and index positions
  getLegacyAddress(xpub: string, account: number, index: number): string {
    const { address } = bjs.payments.p2pkh({
      pubkey: bip32.fromBase58(xpub, this.network).derive(account).derive(index).publicKey,
      network: this.network,
    });

    return String(address);
  }

  // derive native SegWit at account and index positions
  getNativeSegWitAddress(xpub: string, account: number, index: number): string {
    const { address } = bjs.payments.p2wpkh({
      pubkey: bip32.fromBase58(xpub, this.network).derive(account).derive(index).publicKey,
      network: this.network,
    });

    return String(address);
  }

  // derive SegWit at account and index positions
  getSegWitAddress(xpub: string, account: number, index: number): string {
    const { address } = bjs.payments.p2sh({
      redeem: bjs.payments.p2wpkh({
        pubkey: bip32.fromBase58(xpub, this.network).derive(account).derive(index).publicKey,
        network: this.network,
      }),
    });
    return String(address);
  }

  // get address given an address type
  getAddress(derivationMode: string, xpub: string, account: number, index: number): string {
    switch (derivationMode) {
      case this.derivationMode.LEGACY:
        return this.getLegacyAddress(xpub, account, index);
      case this.derivationMode.SEGWIT:
        return this.getSegWitAddress(xpub, account, index);
      case this.derivationMode.NATIVE_SEGWIT:
        return this.getNativeSegWitAddress(xpub, account, index);
      default:
        throw new Error(`Invalid derivation Mode: ${derivationMode}`);
    }
  }

  // infer address type from its syntax
  //
  // TODO: improve the prefix matching: make the expected prefix
  // correspond to the actual type (currently, a `ltc1` prefix
  // could match a native Bitcoin address type for instance)
  getDerivationMode(address: string) {
    if (address.match('^(bc1|tb1|ltc1).*')) {
      return this.derivationMode.NATIVE_SEGWIT;
    }
    if (address.match('^(3|2|M).*')) {
      return this.derivationMode.SEGWIT;
    }
    if (address.match('^(1|n|m|L).*')) {
      return this.derivationMode.LEGACY;
    }
    throw new Error('INVALID ADDRESS: '.concat(address).concat(' is not a valid address'));
  }

  toOutputScript(address: string) {
    return toOutputScript(address, this.network);
  }
}

export default Bitcoin;
