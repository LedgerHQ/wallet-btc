import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import coininfo from 'coininfo';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import Xpub from '../xpub';
import Crypto from '../crypto/bitcoin';
import LedgerExplorer from '../explorer/ledgerexplorer';
import Storage from '../storage/mock';
import Merge from '../pickingstrategies/Merge';
import DeepFirst from '../pickingstrategies/DeepFirst';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('testing xpub legacy transactions', () => {
  const network = coininfo.bitcoin.test.toBitcoinJS();

  const explorer = new LedgerExplorer({
    explorerURI: 'http://localhost:20000/blockchain/v3',
    explorerVersion: 'v3',
    disableBatchSize: true,
  });
  const crypto = new Crypto({
    network,
  });

  const xpubs = [1, 2, 3].map((i) => {
    const storage = new Storage();
    const seed = bip39.mnemonicToSeedSync(`test${i} test${i} test${i}`);
    const node = bip32.fromSeed(seed, network);
    const signer = (account: number, index: number) =>
      bitcoin.ECPair.fromWIF(node.derive(account).derive(index).toWIF(), network);
    const xpub = new Xpub({
      storage,
      explorer,
      crypto,
      xpub: node.neutered().toBase58(),
      derivationMode: 'Legacy',
    });
    return {
      storage,
      seed,
      node,
      signer,
      xpub,
    };
  });

  beforeAll(async () => {
    const { address } = await xpubs[0].xpub.getNewAddress(0, 0);

    try {
      await axios.post('http://localhost:28443/chain/clear/all');
      await axios.post(`http://localhost:28443/chain/mine/${address}/1`);
      await axios.post(`http://localhost:28443/chain/faucet/${address}/3.0`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('praline setup error', e);
    }

    // time for explorer to sync
    await sleep(30000);

    try {
      await xpubs[0].xpub.sync();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('praline explorer setup error', e);
    }
  }, 70000);
  /*
  it('should be setup correctly', async () => {
    const balance1 = await xpubs[0].xpub.getXpubBalance();

    expect(balance1.toNumber()).toEqual(5700000000);
  });
*/
  it('merge output strategy should be correct', async () => {
    const utxoPickingStrategy = new Merge();
    let res = await utxoPickingStrategy.selectUnspentUtxosToUse(xpubs[0].xpub, new BigNumber(10000), 0, 1);
    expect(res.unspentUtxos.length).toEqual(1); // only 1 utxo is enough
    expect(Number(res.unspentUtxos[0].value)).toEqual(300000000); // use cheaper utxo first
    res = await utxoPickingStrategy.selectUnspentUtxosToUse(xpubs[0].xpub, new BigNumber(500000000), 0, 1);
    expect(res.unspentUtxos.length).toEqual(2); // need 2 utxo
    expect(Number(res.unspentUtxos[0].value)+Number(res.unspentUtxos[1].value)).toEqual(300000000 + 5000000000);
  }, 70000);

  it('deep first output strategy should be correct', async () => {
    const utxoPickingStrategy = new DeepFirst();
    let res = await utxoPickingStrategy.selectUnspentUtxosToUse(xpubs[0].xpub, new BigNumber(10000), 0, 1);
    expect(res.unspentUtxos.length).toEqual(1); // only 1 utxo is enough
    expect(Number(res.unspentUtxos[0].value)).toEqual(5000000000); // use old utxo first
    res = await utxoPickingStrategy.selectUnspentUtxosToUse(xpubs[0].xpub, new BigNumber(5200000000), 0, 1);
    expect(res.unspentUtxos.length).toEqual(2); // need 2 utxo
    expect(Number(res.unspentUtxos[0].value)+Number(res.unspentUtxos[1].value)).toEqual(300000000 + 5000000000);
  }, 70000);
});
