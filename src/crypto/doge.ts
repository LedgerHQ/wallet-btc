import Bitcoin from './bitcoin';

class Doge extends Bitcoin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor({ network }: { network: any }) {
    super({ network });
  }
}

export default Doge;
