import Bitcoin from './bitcoin';

class Stratis extends Bitcoin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor({ network }: { network: any }) {
    super({ network });
    this.network.bip32.public = 0x0488c21e;
  }
}

export default Stratis;
