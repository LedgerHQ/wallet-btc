import Bitcoin from './bitcoin';

class BitcoinGold extends Bitcoin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor({ network }: { network: any }) {
    super({ network });
    this.network.dustThreshold = 5430;
    this.network.dustPolicy = 'FIXED';
    this.network.usesTimestampedTransaction = false;
  }
}

export default BitcoinGold;
