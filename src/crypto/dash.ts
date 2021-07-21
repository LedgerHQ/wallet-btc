import Bitcoin from './bitcoin';

class Dash extends Bitcoin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor({ network }: { network: any }) {
    super({ network });
    this.network = {
      messagePrefix: '\x19DarkCoin Signed Message:\n',
      bip32: {
        public: 0x02fe52f8,
        private: 0x02fe52cc,
      },
      pubKeyHash: 0x4c,
      scriptHash: 0x10,
      wif: 0xcc,
      dustThreshold: 5460,
    };
    this.network.dustThreshold = 10000;
    this.network.dustPolicy = 'FIXED';
    this.network.usesTimestampedTransaction = false;
  }
}

export default Dash;
