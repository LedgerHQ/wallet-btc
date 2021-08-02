import Bitcoin from './bitcoin';

class ViaCoin extends Bitcoin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor({ network }: { network: any }) {
    super({ network });
    this.network.dustThreshold = 10000;
    this.network.dustPolicy = 'FIXED';
    this.network.usesTimestampedTransaction = false;
  }
}

export default ViaCoin;
