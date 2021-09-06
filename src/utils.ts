/* eslint-disable @typescript-eslint/no-explicit-any */
import * as bitcoin from 'bitcoinjs-lib';
import bs58 from 'bs58';
import { padStart } from 'lodash';
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import coininfo from 'coininfo';
import { Currency, ICrypto } from './crypto/types';

import * as crypto from './crypto';

export function parseHexString(str: any) {
  const result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));
    // eslint-disable-next-line no-param-reassign
    str = str.substring(2, str.length);
  }
  return result;
}

export function encodeBase58Check(vchIn: any) {
  // eslint-disable-next-line no-param-reassign
  vchIn = parseHexString(vchIn);
  let chksum = bitcoin.crypto.sha256(Buffer.from(vchIn));
  chksum = bitcoin.crypto.sha256(chksum);
  chksum = chksum.slice(0, 4);
  const hash = vchIn.concat(Array.from(chksum));
  return bs58.encode(hash);
}

export function toHexDigit(number: any) {
  const digits = '0123456789abcdef';
  // eslint-disable-next-line no-bitwise
  return digits.charAt(number >> 4) + digits.charAt(number & 0x0f);
}

export function toHexInt(number: any) {
  return (
    // eslint-disable-next-line no-bitwise
    toHexDigit((number >> 24) & 0xff) +
    // eslint-disable-next-line no-bitwise
    toHexDigit((number >> 16) & 0xff) +
    // eslint-disable-next-line no-bitwise
    toHexDigit((number >> 8) & 0xff) +
    // eslint-disable-next-line no-bitwise
    toHexDigit(number & 0xff)
  );
}

export function compressPublicKey(publicKey: any) {
  let compressedKeyIndex;
  if (publicKey.substring(0, 2) !== '04') {
    // eslint-disable-next-line no-throw-literal
    throw 'Invalid public key format';
  }
  if (parseInt(publicKey.substring(128, 130), 16) % 2 !== 0) {
    compressedKeyIndex = '03';
  } else {
    compressedKeyIndex = '02';
  }
  const result = compressedKeyIndex + publicKey.substring(2, 66);
  return result;
}

export function createXPUB(depth: any, fingerprint: any, childnum: any, chaincode: any, publicKey: any, network: any) {
  let xpub = toHexInt(network);
  xpub += padStart(depth.toString(16), 2, '0');
  xpub += padStart(fingerprint.toString(16), 8, '0');
  xpub += padStart(childnum.toString(16), 8, '0');
  xpub += chaincode;
  xpub += publicKey;
  return xpub;
}

export function byteSize(count: number) {
  if (count < 0xfd) {
    return 1;
  }
  if (count <= 0xffff) {
    return 2;
  }
  if (count <= 0xffffffff) {
    return 4;
  }
  return 8;
}

// refer to https://github.com/LedgerHQ/lib-ledger-core/blob/fc9d762b83fc2b269d072b662065747a64ab2816/core/src/wallet/bitcoin/api_impl/BitcoinLikeTransactionApi.cpp#L217
export function estimateTxSize(inputCount: number, outputCount: number, currency: ICrypto, derivationMode: string) {
  let txSize = 0;
  let fixedSize = 0;
  // Fixed size computation
  fixedSize = 4; // Transaction version
  if (currency.network.usesTimestampedTransaction) fixedSize += 4; // Timestamp
  fixedSize += byteSize(inputCount); // Number of inputs
  fixedSize += byteSize(outputCount); // Number of outputs
  fixedSize += 4; // Timelock

  const isSegwit = derivationMode === 'Native SegWit' || derivationMode === 'SegWit';
  if (isSegwit) {
    // Native Segwit: 32 PrevTxHash + 4 Index + 1 null byte + 4 sequence
    // P2SH: 32 PrevTxHash + 4 Index + 23 scriptPubKey + 4 sequence
    const isNativeSegwit = derivationMode === 'Native SegWit';
    const inputSize = isNativeSegwit ? 41 : 63;
    const noWitness = fixedSize + inputSize * inputCount + 34 * outputCount;
    // Include flag and marker size (one byte each)
    const witnessSize = noWitness + 108 * inputCount + 2;
    txSize = (noWitness * 3 + witnessSize) / 4;
  } else {
    txSize = fixedSize + 148 * inputCount + 34 * outputCount;
  }
  return Math.ceil(txSize); // We don't allow floating value
}

// refer to https://github.com/LedgerHQ/lib-ledger-core/blob/fc9d762b83fc2b269d072b662065747a64ab2816/core/src/wallet/bitcoin/api_impl/BitcoinLikeTransactionApi.cpp#L253
export function computeDustAmount(currency: ICrypto, txSize: number) {
  let dustAmount = currency.network.dustThreshold;
  switch (currency.network.dustPolicy) {
    case 'PER_KBYTE':
      dustAmount = (dustAmount * txSize) / 1000;
      break;
    case 'PER_BYTE':
      dustAmount *= txSize;
      break;
    default:
      break;
  }
  return dustAmount;
}

export function isValidAddress(address: string) {
  try {
    bitcoin.address.fromBase58Check(address);
  } catch {
    // Not a valid Base58 address
    try {
      bitcoin.address.fromBech32(address);
    } catch {
      // Not a valid Bech32 address either
      return false;
    }
  }
  return true;
}

export function cryptoFactory(currency: Currency) {
  let res: ICrypto;
  switch (currency) {
    case 'bitcoin': {
      const network = coininfo.bitcoin.main.toBitcoinJS();
      res = new crypto.Bitcoin({ network });
      break;
    }
    case 'bitcoin_cash': {
      const network = coininfo.bitcoincash.main.toBitcoinJS();
      res = new crypto.BitcoinCash({ network });
      break;
    }
    case 'litecoin': {
      const network = coininfo.litecoin.main.toBitcoinJS();
      res = new crypto.Litecoin({ network });
      break;
    }
    case 'dash': {
      const network = coininfo.dash.main.toBitcoinJS();
      res = new crypto.Dash({ network });
      break;
    }
    case 'qtum': {
      const network = coininfo.qtum.main.toBitcoinJS();
      res = new crypto.Qtum({ network });
      break;
    }
    case 'zcash': {
      const network = coininfo.zcash.main.toBitcoinJS();
      res = new crypto.Zec({ network });
      break;
    }
    case 'bitcoin_gold': {
      const network = coininfo['bitcoin gold'].main.toBitcoinJS();
      res = new crypto.BitcoinGold({ network });
      break;
    }
    case 'dogecoin': {
      const network = coininfo.dogecoin.main.toBitcoinJS();
      res = new crypto.Doge({ network });
      break;
    }
    case 'digibyte': {
      const network = coininfo.digibyte.main.toBitcoinJS();
      res = new crypto.Digibyte({ network });
      break;
    }
    case 'komodo': {
      const network = coininfo.bitcoin.main.toBitcoinJS();
      res = new crypto.Komodo({ network });
      break;
    }
    case 'pivx': {
      const network = coininfo.bitcoin.main.toBitcoinJS();
      res = new crypto.Pivx({ network });
      break;
    }
    case 'zencash': {
      const network = coininfo.zcash.main.toBitcoinJS();
      res = new crypto.Zen({ network });
      break;
    }
    case 'vertcoin': {
      const network = coininfo.vertcoin.main.toBitcoinJS();
      res = new crypto.Vertcoin({ network });
      break;
    }
    case 'peercoin': {
      const network = coininfo.peercoin.main.toBitcoinJS();
      res = new crypto.Peercoin({ network });
      break;
    }
    case 'viacoin': {
      const network = coininfo.viacoin.main.toBitcoinJS();
      res = new crypto.ViaCoin({ network });
      break;
    }
    case 'stakenet': {
      const network = coininfo.bitcoin.main.toBitcoinJS();
      res = new crypto.Stakenet({ network });
      break;
    }
    case 'stealthcoin': {
      const network = coininfo.bitcoin.main.toBitcoinJS();
      res = new crypto.Stealth({ network });
      break;
    }
    case 'bitcoin_testnet': {
      const network = coininfo.bitcoin.test.toBitcoinJS();
      res = new crypto.Bitcoin({ network });
      break;
    }
    default: {
      throw new Error(`Currency ${currency} doesn't exist!`);
    }
  }
  return res;
}
