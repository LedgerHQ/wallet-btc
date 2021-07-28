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
import CoinSelect from '../pickingstrategies/CoinSelect';

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

  const storage = new Storage();
  const seed = bip39.mnemonicToSeedSync('test1 test1 test1');
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
  const dataset = {
    storage,
    seed,
    node,
    signer,
    xpub,
  };

  it('merge output strategy should be correct', async () => {
    const { address } = await dataset.xpub.getNewAddress(0, 0);
    try {
      await axios.post('http://localhost:28443/chain/clear/all');
      await sleep(10000);
      await axios.post(`http://localhost:28443/chain/mine/${address}/1`);
      await axios.post(`http://localhost:28443/chain/faucet/${address}/3.0`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('praline setup error', e);
    }
    // time for explorer to sync
    await sleep(40000);
    try {
      await dataset.xpub.sync();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('xpub sync error', e);
    }
    const utxoPickingStrategy = new Merge(dataset.xpub.crypto, dataset.xpub.derivationMode);
    let res = await utxoPickingStrategy.selectUnspentUtxosToUse(dataset.xpub, new BigNumber(10000), 0, 1);
    expect(res.unspentUtxos.length).toEqual(1); // only 1 utxo is enough
    expect(Number(res.unspentUtxos[0].value)).toEqual(300000000); // use cheaper utxo first
    res = await utxoPickingStrategy.selectUnspentUtxosToUse(dataset.xpub, new BigNumber(500000000), 0, 1);
    expect(res.unspentUtxos.length).toEqual(2); // need 2 utxo
    expect(Number(res.unspentUtxos[0].value) + Number(res.unspentUtxos[1].value)).toEqual(300000000 + 5000000000);
  }, 100000);

  it('deep first output strategy should be correct', async () => {
    const { address } = await dataset.xpub.getNewAddress(0, 0);
    try {
      await axios.post('http://localhost:28443/chain/clear/all');
      await sleep(10000);
      await axios.post(`http://localhost:28443/chain/mine/${address}/1`);
      await axios.post(`http://localhost:28443/chain/faucet/${address}/3.0`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('praline setup error', e);
    }
    // time for explorer to sync
    await sleep(40000);
    try {
      await dataset.xpub.sync();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('xpub sync error', e);
    }
    const utxoPickingStrategy = new DeepFirst(dataset.xpub.crypto, dataset.xpub.derivationMode);
    let res = await utxoPickingStrategy.selectUnspentUtxosToUse(dataset.xpub, new BigNumber(10000), 0, 1);
    expect(res.unspentUtxos.length).toEqual(1); // only 1 utxo is enough
    expect(Number(res.unspentUtxos[0].value)).toEqual(5000000000); // use old utxo first
    res = await utxoPickingStrategy.selectUnspentUtxosToUse(dataset.xpub, new BigNumber(5200000000), 0, 1);
    expect(res.unspentUtxos.length).toEqual(2); // need 2 utxo
    expect(Number(res.unspentUtxos[0].value) + Number(res.unspentUtxos[1].value)).toEqual(300000000 + 5000000000);
  }, 100000);

  it('coin select strategy should be correct', async () => {
    const { address } = await dataset.xpub.getNewAddress(0, 0);
    try {
      await axios.post('http://localhost:28443/chain/clear/all');
      await sleep(60000);
      await axios.post(`http://localhost:28443/chain/mine/${address}/1`);
      await axios.post(`http://localhost:28443/chain/faucet/${address}/3.0`);
      await axios.post(`http://localhost:28443/chain/faucet/${address}/1.0`);
      await axios.post(`http://localhost:28443/chain/faucet/${address}/2.0`);
      await axios.post(`http://localhost:28443/chain/faucet/${address}/6.0`);
      await sleep(60000);
      await dataset.xpub.sync();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('xpub sync error or praline setup error', e);
    }
    // we have 5 utxo now. 100000000, 200000000, 300000000, 600000000 and 5000000000
    const utxoPickingStrategy = new CoinSelect(dataset.xpub.crypto, dataset.xpub.derivationMode);
    let res = await utxoPickingStrategy.selectUnspentUtxosToUse(dataset.xpub, new BigNumber(10000), 0, 1);
    expect(res.unspentUtxos.length).toEqual(1);
    expect(Number(res.unspentUtxos[0].value)).toEqual(100000000);

    res = await utxoPickingStrategy.selectUnspentUtxosToUse(dataset.xpub, new BigNumber(290000000), 10, 1);
    expect(res.unspentUtxos.length).toEqual(2);
    expect(Number(res.unspentUtxos[0].value) + Number(res.unspentUtxos[1].value)).toEqual(100000000 + 200000000);

    res = await utxoPickingStrategy.selectUnspentUtxosToUse(dataset.xpub, new BigNumber(500000000), 0, 1);
    expect(res.unspentUtxos.length).toEqual(2);
    expect(Number(res.unspentUtxos[0].value) + Number(res.unspentUtxos[1].value)).toEqual(200000000 + 300000000);

    res = await utxoPickingStrategy.selectUnspentUtxosToUse(dataset.xpub, new BigNumber(800000000), 0, 1);
    expect(res.unspentUtxos.length).toEqual(2);
    expect(Number(res.unspentUtxos[0].value) + Number(res.unspentUtxos[1].value)).toEqual(200000000 + 600000000);
  }, 180000);
});
