import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import coininfo from 'coininfo';
import axios from 'axios';
import Xpub from '../xpub';
import Crypto from '../crypto/bitcoin';
import Explorer from '../explorer/ledger.v3.2.4';
import Storage from '../storage/mock';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const describeToUse = process.env.CI ? describe.skip : describe;

describeToUse('testing legacy transactions', () => {
  const network = coininfo.bitcoin.test.toBitcoinJS();

  const explorer = new Explorer({
    explorerURI: 'http://localhost:20000/blockchain/v3',
    disableBatchSize: true, // https://ledgerhq.atlassian.net/browse/BACK-2191
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
      await axios.post(`http://localhost:28443/chain/faucet/${address}/7.0`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('praline setup error', e);
    }

    // time for explorer to sync
    await sleep(20000);

    try {
      await xpubs[0].xpub.sync();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('praline explorer setup error', e);
    }
  }, 30000);

  it('should be setup correctly', async () => {
    const balance1 = await xpubs[0].xpub.getXpubBalance();

    expect(balance1).toEqual(5700000000);
  });

  it('should send a 1 btc tx to xpubs[1].xpub', async () => {
    const { address } = await xpubs[1].xpub.getNewAddress(0, 0);
    const { address: change } = await xpubs[0].xpub.getNewAddress(1, 0);

    const psbt = new bitcoin.Psbt({ network });

    const { inputs, associatedDerivations, outputs } = await xpubs[0].xpub.buildTx(address, 100000000, 500, change);

    inputs.forEach(([txHex, index]) => {
      const nonWitnessUtxo = Buffer.from(txHex, 'hex');
      const tx = bitcoin.Transaction.fromHex(txHex);

      psbt.addInput({
        hash: tx.getId(),
        index,
        nonWitnessUtxo,
      });
    });
    outputs.forEach((output) => {
      psbt.addOutput({
        script: output.script,
        value: output.value,
      });
    });
    inputs.forEach((_, i) => {
      psbt.signInput(i, xpubs[0].signer(associatedDerivations[i][0], associatedDerivations[i][1]));
      psbt.validateSignaturesOfInput(i);
    });
    psbt.finalizeAllInputs();
    const rawTxHex = psbt.extractTransaction().toHex();
    //

    try {
      await xpubs[0].xpub.broadcastTx(rawTxHex);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('broadcast error', e);
    }

    try {
      const { address: mineAddress } = await xpubs[2].xpub.getNewAddress(0, 0);
      await axios.post(`http://localhost:28443/chain/mine/${mineAddress}/1`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('praline error');
    }

    // time for explorer to sync
    await sleep(20000);

    await xpubs[0].xpub.sync();
    await xpubs[1].xpub.sync();

    expect(await xpubs[0].xpub.getXpubBalance()).toEqual(5700000000 - 100000000 - 500);
    expect(await xpubs[1].xpub.getXpubBalance()).toEqual(100000000);
  }, 30000);
});
