"use strict";
// from https://github.com/LedgerHQ/xpub-scan/blob/master/src/actions/deriveAddresses.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var bjs = __importStar(require("bitcoinjs-lib"));
var bip32 = __importStar(require("bip32"));
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
var address_1 = require("bitcoinjs-lib/src/address");
var Bitcoin = /** @class */ (function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function Bitcoin(_a) {
        var network = _a.network;
        this.DerivationMode = {
            LEGACY: 'Legacy',
            NATIVE: 'Native SegWit',
            SEGWIT: 'SegWit',
        };
        this.network = network;
    }
    // derive legacy address at account and index positions
    Bitcoin.prototype.getLegacyAddress = function (xpub, account, index) {
        var address = bjs.payments.p2pkh({
            pubkey: bip32.fromBase58(xpub, this.network).derive(account).derive(index).publicKey,
            network: this.network,
        }).address;
        return String(address);
    };
    // derive native SegWit at account and index positions
    Bitcoin.prototype.getNativeSegWitAddress = function (xpub, account, index) {
        var address = bjs.payments.p2wpkh({
            pubkey: bip32.fromBase58(xpub, this.network).derive(account).derive(index).publicKey,
            network: this.network,
        }).address;
        return String(address);
    };
    // derive SegWit at account and index positions
    Bitcoin.prototype.getSegWitAddress = function (xpub, account, index) {
        var address = bjs.payments.p2sh({
            redeem: bjs.payments.p2wpkh({
                pubkey: bip32.fromBase58(xpub, this.network).derive(account).derive(index).publicKey,
                network: this.network,
            }),
        }).address;
        return String(address);
    };
    // get address given an address type
    Bitcoin.prototype.getAddress = function (derivationMode, xpub, account, index) {
        switch (derivationMode) {
            case this.DerivationMode.LEGACY:
                return this.getLegacyAddress(xpub, account, index);
            case this.DerivationMode.SEGWIT:
                return this.getSegWitAddress(xpub, account, index);
            case this.DerivationMode.NATIVE:
                return this.getNativeSegWitAddress(xpub, account, index);
            default:
                throw new Error('Invalide derivation Mode');
        }
    };
    // infer address type from its syntax
    //
    // TODO: improve the prefix matching: make the expected prefix
    // correspond to the actual type (currently, a `ltc1` prefix
    // could match a native Bitcoin address type for instance)
    Bitcoin.prototype.getDerivationMode = function (address) {
        if (address.match('^(bc1|tb1|ltc1).*')) {
            return this.DerivationMode.NATIVE;
        }
        if (address.match('^(3|2|M).*')) {
            return this.DerivationMode.SEGWIT;
        }
        if (address.match('^(1|n|m|L).*')) {
            return this.DerivationMode.LEGACY;
        }
        throw new Error('INVALID ADDRESS: '.concat(address).concat(' is not a valid address'));
    };
    Bitcoin.prototype.toOutputScript = function (address) {
        return address_1.toOutputScript(address, this.network);
    };
    return Bitcoin;
}());
exports.default = Bitcoin;
//# sourceMappingURL=bitcoin.js.map