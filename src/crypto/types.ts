// all things derivation
export interface DerivationMode {
  [index: string]: string;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ICrypto {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  network: any;
  DerivationMode: DerivationMode;
  getAddress(derivationMode: string, xpub: string, account: number, index: number): string;
  getDerivationMode(address: string): string;

  toOutputScript(address: string): Buffer;
}
