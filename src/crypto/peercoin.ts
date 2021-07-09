import Bitcoin from './bitcoin';

class Peercoin extends Bitcoin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor({ network }: { network: any }) {
    super({ network });
    // https://github.com/LedgerHQ/lib-ledger-core/blob/master/core/src/wallet/bitcoin/networks.cpp#L176
    this.network.bip32.public = 0xe6e8e9e5;
  }
}

export default Peercoin;
