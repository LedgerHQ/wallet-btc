/// <reference types="node" />
export interface DerivationMode {
    [index: string]: string;
}
export interface ICrypto {
    network: any;
    DerivationMode: DerivationMode;
    getAddress(derivationMode: string, xpub: string, account: number, index: number): string;
    getDerivationMode(address: string): string;
    toOutputScript(address: string): Buffer;
}
