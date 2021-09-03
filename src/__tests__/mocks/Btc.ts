import hash from 'object-hash';
import { BtcAppCreateTransactionArg, BtcAppTransaction } from '../../types';

const parse = (stringify: string) =>
  JSON.parse(stringify, (k, v) => {
    if (
      v !== null &&
      typeof v === 'object' &&
      'type' in v &&
      v.type === 'Buffer' &&
      'data' in v &&
      Array.isArray(v.data)
    ) {
      // eslint-disable-next-line no-buffer-constructor
      return new Buffer(v.data);
    }
    return v;
  });

class MockBtc {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  async getWalletPublicKey(
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    opts: { verify?: boolean; format?: 'legacy' | 'p2sh' | 'bech32' | 'cashaddr' }
  ) {
    switch (path) {
      case "44'/0'":
        return {
          publicKey:
            '04c621f37493d99f39ca12fb02ba7fe1687b1650b875dcb6733f386a98958e6556fc95dcecb6ac41af0a5296965751b1598aa475a537474bab5b316fcdc1196568',
          chainCode: 'a45d311c31a80bf06cc38d8ed7934bd1e8a7b2d48b2868a70258a86e094bacfb',
          bitcoinAddress: '1BKWjmA9swxRKMH9NgXpSz8YZfVMnWWU9D',
        };
        break;
      case "44'/0'/0'":
        return {
          publicKey:
            '04d52d1ad9311c5a3d542fa652fbd7d7b0be70109e329d359704d9f2946f8eb52a829c23f8b980c5f7b6c51bf446b21f3dc80c865095243c9215dbf9f3cb6403b8',
          chainCode: '0bd3e45edca4d8a466f523a2c4094c412d25c36d5298b2d3a29938151a8d37fe',
          bitcoinAddress: '1FHa4cuKdea21ByTngP9vz3KYDqqQe9SsA',
        };
        break;
      default:
        throw new Error('not supported');
    }
  }

  // eslint-disable-next-line class-methods-use-this
  splitTransaction(
    transactionHex: string,
    isSegwitSupported?: boolean,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hasTimestamp?: boolean,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hasExtraData?: boolean,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    additionals?: string[]
  ): BtcAppTransaction {
    switch (transactionHex + isSegwitSupported.toString()) {
      case '01000000010f9c67a5f6f461e9b853f9e29797fce85e036613c44f37832a956fbe817d2ffa000000006b483045022100c595d02c9b300f47ec4aa61722c0207c9753b2080af5182b399b5fb3fcec77fb02200bc5a45310c4cf2fe0e4a8d975bafe36f26f94c5e5eeee0e752467613ca7bae5012103ea6c89f601302441940953b05a7cb69a79b32ab8f7bab9d2c4b61132c5e49b93ffffffff02e8030000000000001976a914497c20648c211bfd50087fad49ad59547c25763e88ac38a60100000000001976a914f1c33550b7e603ebff3dea5c1bd035f83040435888ac00000000true':
        return parse(
          '{"version":{"type":"Buffer","data":[1,0,0,0]},"inputs":[{"prevout":{"type":"Buffer","data":[15,156,103,165,246,244,97,233,184,83,249,226,151,151,252,232,94,3,102,19,196,79,55,131,42,149,111,190,129,125,47,250,0,0,0,0]},"script":{"type":"Buffer","data":[72,48,69,2,33,0,197,149,208,44,155,48,15,71,236,74,166,23,34,192,32,124,151,83,178,8,10,245,24,43,57,155,95,179,252,236,119,251,2,32,11,197,164,83,16,196,207,47,224,228,168,217,117,186,254,54,242,111,148,197,229,238,238,14,117,36,103,97,60,167,186,229,1,33,3,234,108,137,246,1,48,36,65,148,9,83,176,90,124,182,154,121,179,42,184,247,186,185,210,196,182,17,50,197,228,155,147]},"sequence":{"type":"Buffer","data":[255,255,255,255]},"tree":{"type":"Buffer","data":[]}}],"outputs":[{"amount":{"type":"Buffer","data":[232,3,0,0,0,0,0,0]},"script":{"type":"Buffer","data":[118,169,20,73,124,32,100,140,33,27,253,80,8,127,173,73,173,89,84,124,37,118,62,136,172]}},{"amount":{"type":"Buffer","data":[56,166,1,0,0,0,0,0]},"script":{"type":"Buffer","data":[118,169,20,241,195,53,80,183,230,3,235,255,61,234,92,27,208,53,248,48,64,67,88,136,172]}}],"locktime":{"type":"Buffer","data":[0,0,0,0]},"timestamp":{"type":"Buffer","data":[]},"nVersionGroupId":{"type":"Buffer","data":[]},"nExpiryHeight":{"type":"Buffer","data":[]},"extraData":{"type":"Buffer","data":[]}}'
        );
      default:
        throw new Error('not supported');
    }
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  async createPaymentTransactionNew(arg: BtcAppCreateTransactionArg) {
    return hash(arg);
  }
}

export default MockBtc;
