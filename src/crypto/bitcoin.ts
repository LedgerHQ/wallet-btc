// from https://github.com/LedgerHQ/xpub-scan/blob/master/src/actions/deriveAddresses.ts

import * as bjs from 'bitcoinjs-lib';
import * as bip32 from 'bip32';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { toOutputScript } from 'bitcoinjs-lib/src/address';
import { DerivationModes } from '../types';
import { ICrypto, DerivationMode } from './types';
import { fromBech32, isValidAddress } from '../utils';

// This function expects a valid base58check address or a valid
// bech32/bech32m address.
function toOutputScriptTemporary(validAddress: string, network: bjs.Network): Buffer {
  try {
    const decodeBase58 = bjs.address.fromBase58Check(validAddress);
    if (decodeBase58.version === network.pubKeyHash)
      return bjs.payments.p2pkh({ hash: decodeBase58.hash }).output as Buffer;
    if (decodeBase58.version === network.scriptHash)
      return bjs.payments.p2sh({ hash: decodeBase58.hash }).output as Buffer;
  } catch (e) {
    // It's not a base58 address, so it's a segwit address
  }
  const decodeBech32 = fromBech32(validAddress);
  return bjs.script.compile([
    // OP_0 is encoded as 0x00, but OP_1 through OP_16 are encoded as 0x51 though 0x60, see BIP173
    decodeBech32.version + (decodeBech32.version > 0 ? 0x50 : 0),
    decodeBech32.data,
  ]);
}

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
  getDerivationMode(address: string) {
    if (address.match('^(bc1|tb1).*')) {
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
    // Make sure the address is valid on this network
    // otherwise we can't call toOutputScriptTemporary.
    if (!isValidAddress(address, this.network)) {
      throw new Error('Invalid address');
    }
    // bitcoinjs-lib/src/address doesn't yet have released support for bech32m,
    // so we'll implement our own version of toOutputScript while waiting.
    // This implementation is highly inspired (stolen) from bitcoinjs-lib's
    // master branch.
    // One major difference is that our function requires an already
    // valid address, whereas to bitcoinjs-lib version doesn't.
    return toOutputScriptTemporary(address, this.network);
  }
}

export default Bitcoin;
