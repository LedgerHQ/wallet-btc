import { ICrypto, DerivationMode } from './types';
declare class BitcoinCash implements ICrypto {
    network: any;
    DerivationMode: DerivationMode;
    constructor({ network }: {
        network: any;
    });
    getLegacyBitcoinCashAddress(xpub: string, account: number, index: number): string;
    getAddress(derivationMode: string, xpub: string, account: number, index: number): string;
    getDerivationMode(address: string): string;
    toOutputScript(address: string): any;
}
export default BitcoinCash;
