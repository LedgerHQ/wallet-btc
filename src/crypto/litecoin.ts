import * as bjs from 'bitcoinjs-lib';
import * as bip32 from 'bip32';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { toOutputScript } from 'bitcoinjs-lib/src/address';
import { ICrypto, DerivationMode } from './types';
// Todo copy paste from bitcoin.ts. we can merge them later
class Litecoin implements ICrypto {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  network: any;

  DerivationMode: DerivationMode = {
    LEGACY: 'Legacy',
    SEGWIT: 'SegWit',
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor({ network }: { network: any }) {
    this.network = network;
  }

  getLegacyAddress(xpub: string, account: number, index: number): string {
    const { address } = bjs.payments.p2pkh({
      pubkey: bip32.fromBase58(xpub, this.network).derive(account).derive(index).publicKey,
      network: this.network,
    });
    return String(address);
  }

  getSegWitAddress(xpub: string, account: number, index: number): string {
    const { address } = bjs.payments.p2sh({
      redeem: bjs.payments.p2wpkh({
        pubkey: bip32.fromBase58(xpub, this.network).derive(account).derive(index).publicKey,
        network: this.network,
      }),
    });
    return String(address);
  }

  getAddress(derivationMode: string, xpub: string, account: number, index: number): string {
    switch (derivationMode) {
      case this.DerivationMode.LEGACY:
        return this.getLegacyAddress(xpub, account, index);
      case this.DerivationMode.SEGWIT:
        return this.getSegWitAddress(xpub, account, index);
      default:
        throw new Error('Should not be reachable');
    }
  }

  getDerivationMode(address: string) {
    if (address.match('^(3|2|M).*')) {
      return this.DerivationMode.SEGWIT;
    }
    if (address.match('^(1|n|m|L).*')) {
      return this.DerivationMode.LEGACY;
    }
    throw new Error('INVALID ADDRESS: '.concat(address).concat(' is not a valid address'));
  }

  toOutputScript(address: string) {
    return toOutputScript(address, this.network);
  }
}

export default Litecoin;
