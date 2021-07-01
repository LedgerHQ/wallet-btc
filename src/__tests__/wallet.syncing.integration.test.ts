/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'path';
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import coininfo from 'coininfo';
import { toMatchFile } from 'jest-file-snapshot';
import { orderBy } from 'lodash';
import Storage from '../storage/mock';
import Explorer from '../explorer/ledger.v3.2.4';
import Xpub from '../xpub';
import Bitcoin from '../crypto/bitcoin';
import BitcoinCash from '../crypto/bitcoincash';
import Litecoin from '../crypto/litecoin';
import Digibyte from '../crypto/digibyte';

const startLogging = (emitters: any) => {
  emitters.forEach((emitter: any) =>
    emitter.emitter.on(emitter.event, (data: any) => {
      if (data.type === emitter.type) {
        // eslint-disable-next-line no-console
        console.log(emitter.event, JSON.stringify(data, null, 2));
      }
    })
  );
};
const stopLogging = (emitters: any) => {
  emitters.forEach((emitter: any) => emitter.removeAllListeners());
};

expect.extend({ toMatchFile });

describe('integration sync', () => {
  const walletDatasets = [
    {
      xpub: 'xpub6CMtoA66sLkbsZo8RNq7PoKz19WdThkSxNzwz8MgyjhsPjVwjFqXqb69xyRVGs2iSd98yDrVL4A6tC2vsTsgQDPXFa46AvPoh5PWhppNdoV',
      derivationMode: 'SegWit',
      addresses: 46,
      balance: 308018,
      network: coininfo['bitcoin gold'].main.toBitcoinJS(),
      coin: 'btg',
    },
    {
      xpub: 'tpubDCYcGoj35gRcahvoxni1TTEaSgbqWXtqG6HvFWoXbXC2fbw2mprWwyKzvgv4WY4pBs8SL9wZzQYZ8bX9ecKQ91C5eTnsGuVEBKnborrKhUH',
      derivationMode: 'SegWit',
      addresses: 7,
      balance: 375496,
      network: coininfo.bitcoin.test.toBitcoinJS(),
      coin: 'btc_testnet',
    },
    {
      xpub: 'xpub6Bn7mxuS3VxCqofYcGaZDm2iAfSoGN9bY5LA2QG69BWaMtS4F58WgAYJhhUBjcwJJpLNtMB6i15J7gwBot6rNouLuuBEsA9uHxFAhQcD1M2',
      derivationMode: 'SegWit',
      addresses: 38,
      balance: 403178204,
      network: coininfo.digibyte.main.toBitcoinJS(),
      coin: 'dgb',
    },
    {
      xpub: 'xpub6C3xxFdpsuBPQegeJHvf1G6YMRkay4YJCERUmsWW3DbfcREPeEbcML7nmk79AMgcCu1YkC5CA2s1TZ5ubmVsWuEr7N97X6z2vtrpRzvQbhG',
      derivationMode: 'Native SegWit',
      addresses: 52,
      balance: 80711645,
      network: coininfo.digibyte.main.toBitcoinJS(),
      coin: 'dgb',
    },
    {
      xpub: 'xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz', // 3000ms
      derivationMode: 'Legacy',
      addresses: 15,
      balance: 12678243,
      network: coininfo.bitcoin.main.toBitcoinJS(),
      coin: 'btc',
    },
    {
      xpub: 'xpub6D4waFVPfPCpRvPkQd9A6n65z3hTp6TvkjnBHG5j2MCKytMuadKgfTUHqwRH77GQqCKTTsUXSZzGYxMGpWpJBdYAYVH75x7yMnwJvra1BUJ', // 5400ms
      derivationMode: 'Legacy',
      addresses: 506,
      balance: 166505122,
      network: coininfo.bitcoin.main.toBitcoinJS(),
      coin: 'btc',
    },
    {
      xpub: 'xpub6BvNdfGcyMB9Usq88ibXUt3KhbaEJVLFMbhTSNNfTm8Qf1sX9inTv3xL6pA6KofW4WF9GpdxwGDoYRwRDjHEir3Av23m2wHb7AqhxJ9ohE8',
      addresses: 16,
      balance: 360615,
      network: coininfo.bitcoincash.main.toBitcoinJS(),
      derivationMode: 'BCH',
      coin: 'bch',
    },
    {
      xpub: 'xpub6CThYZbX4PTeA7KRYZ8YXP3F6HwT2eVKPQap3Avieds3p1eos35UzSsJtTbJ3vQ8d3fjRwk4bCEz4m4H6mkFW49q29ZZ6gS8tvahs4WCZ9X', // 138sec,
      derivationMode: 'Legacy',
      addresses: 9741,
      balance: 0,
      network: coininfo.bitcoin.main.toBitcoinJS(),
      coin: 'btc',
    },
    {
      xpub: 'Ltub2ZgHGhWdGi2jacCdKEy3qddYxH4bpDtmueiPWkG8267Z9K8yQEExapyNi1y4Qp7f79JN8468uE9V3nizpPU27WEDfXrtqpkp84MyhhCDTNk',
      addresses: 5,
      balance: 87756,
      network: coininfo.litecoin.main.toBitcoinJS(),
      derivationMode: 'Legacy',
      coin: 'ltc',
    },
    /*
    {
      xpub: 'xpub6CRQUSTkAa6PDK8Jof6rrUX2YvWAyMxcMSev4cngAagUVKjfRHynULK4XetpqoL1PhversYdPYf7kyZkYs352akzSrd6Wvfpf9QqHCqd5D3',
      derivationMode: 'SegWit',
      addresses: 0,
      balance: 0,
      network: coininfo.bitcoin.main.toBitcoinJS(),
      coin: 'xsn',
    },
    {
      xpub: 'xpub6DWu8baXZKRb3FbLebkpXq2qm1hH4N9F8hzTBoZAWrPNBAXgCSK8qqfsc38gaCEFZWUS9rJHMgE3DS4rh7Qqn47PHKHYkMzWXfo39cYdwVJ',
      derivationMode: 'Legacy',
      addresses: 0,
      balance: 0,
      network: coininfo.zcash.main.toBitcoinJS(),
      coin: 'zec',
    }, */
  ];

  walletDatasets.forEach((dataset) =>
    describe(`xpub ${dataset.xpub} ${dataset.derivationMode}`, () => {
      const storage = new Storage();
      let crypto;
      switch (dataset.coin) {
        case 'btc':
          crypto = new Bitcoin({ network: dataset.network });
          break;
        case 'bch':
          crypto = new BitcoinCash({ network: dataset.network });
          break;
        case 'ltc':
          crypto = new Litecoin({ network: dataset.network });
          break;
        case 'btc_testnet':
          crypto = new Bitcoin({ network: dataset.network });
          break;
        case 'btg': // bitcoin gold
          crypto = new Bitcoin({ network: dataset.network });
          break;
        case 'dgb': // digibyte
          crypto = new Digibyte({ network: dataset.network });
          break;
        // todo support the following coins
        /*
        case 'dash':
          crypto = new Bitcoin({ network: dataset.network });
          break;
        case 'doge': // dogecoin
          crypto = new Bitcoin({ network: dataset.network });
          break;
        case 'kmd': // komodo
          crypto = new Bitcoin({ network: dataset.network });
          break;
        case 'ppc': // peercoin
          crypto = new Bitcoin({ network: dataset.network });
          break;
        case 'pivx':
          crypto = new Bitcoin({ network: dataset.network });
          break;
        case 'qtum':
          crypto = new Bitcoin({ network: dataset.network });
          break;
        case 'xsn': // stakenet
          crypto = new Bitcoin({ network: dataset.network });
          break;
        case 'xst': // stealthcoin
          crypto = new Bitcoin({ network: dataset.network });
          break;
        case 'strat': // stratis
          crypto = new Bitcoin({ network: dataset.network });
          break;
        case 'vtc': // vertcoin
          crypto = new Bitcoin({ network: dataset.network });
          break;
        case 'via': // viacoin
          crypto = new Bitcoin({ network: dataset.network });
          break;
        case 'zec': // zcash
          crypto = new Bitcoin({ network: dataset.network });
          break;
        case 'zen': // zencash
          crypto = new Bitcoin({ network: dataset.network });
          break; */
        default:
          throw new Error('Should not be reachable');
      }

      const xpub = new Xpub({
        storage,
        explorer: new Explorer({
          explorerURI: `https://explorers.api.vault.ledger.com/blockchain/v3/${dataset.coin}`,
        }),
        crypto,
        xpub: dataset.xpub,
        derivationMode: dataset.derivationMode,
      });

      beforeAll(() => {
        startLogging([
          { emitter: xpub, event: 'syncing', type: 'address' },
          { emitter: xpub.explorer, event: null },
        ]);
      });
      afterAll(() => {
        stopLogging([xpub, xpub.explorer]);
      });

      it(
        'should sync from zero correctly',
        async () => {
          await xpub.sync();

          const truthDump = path.join(__dirname, 'data', 'sync', `${dataset.xpub}.json`);

          const txs = orderBy(await storage.export(), ['derivationMode', 'account', 'index', 'block.height', 'id']);
          expect(JSON.stringify(txs, null, 2)).toMatchFile(truthDump);
          expect(await xpub.getXpubBalance()).toEqual(dataset.balance);
          const addresses = await xpub.getXpubAddresses();
          expect(addresses.length).toEqual(dataset.addresses);
        },
        // github so slow
        15 * 60 * 1000
      );
    })
  );
});
