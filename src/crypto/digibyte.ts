import Bitcoin from './bitcoin';

class Digibyte extends Bitcoin {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor({ network }: { network: any }) {
    // missing bip32 info in coininfo network for digibyte, we fill it mannually
    // https://electrum.readthedocs.io/en/latest/xpub_version_bytes.html
    super({ network });
    this.network.bip32 = { public: 0x0488b21e, private: 0x0488ade4 };
  }
}

export default Digibyte;
