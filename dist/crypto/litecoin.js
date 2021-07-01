"use strict";
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
// Todo copy paste from bitcoin.ts. we can merge them later
var Litecoin = /** @class */ (function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function Litecoin(_a) {
        var network = _a.network;
        this.DerivationMode = {
            LEGACY: 'Legacy',
            SEGWIT: 'SegWit',
        };
        this.network = network;
    }
    Litecoin.prototype.getLegacyAddress = function (xpub, account, index) {
        var address = bjs.payments.p2pkh({
            pubkey: bip32.fromBase58(xpub, this.network).derive(account).derive(index).publicKey,
            network: this.network,
        }).address;
        return String(address);
    };
    Litecoin.prototype.getSegWitAddress = function (xpub, account, index) {
        var address = bjs.payments.p2sh({
            redeem: bjs.payments.p2wpkh({
                pubkey: bip32.fromBase58(xpub, this.network).derive(account).derive(index).publicKey,
                network: this.network,
            }),
        }).address;
        return String(address);
    };
    Litecoin.prototype.getAddress = function (derivationMode, xpub, account, index) {
        switch (derivationMode) {
            case this.DerivationMode.LEGACY:
                return this.getLegacyAddress(xpub, account, index);
            case this.DerivationMode.SEGWIT:
                return this.getSegWitAddress(xpub, account, index);
            default:
                throw new Error('Should not be reachable');
        }
    };
    Litecoin.prototype.getDerivationMode = function (address) {
        if (address.match('^(3|2|M).*')) {
            return this.DerivationMode.SEGWIT;
        }
        if (address.match('^(1|n|m|L).*')) {
            return this.DerivationMode.LEGACY;
        }
        throw new Error('INVALID ADDRESS: '.concat(address).concat(' is not a valid address'));
    };
    Litecoin.prototype.toOutputScript = function (address) {
        return address_1.toOutputScript(address, this.network);
    };
    return Litecoin;
}());
exports.default = Litecoin;
//# sourceMappingURL=litecoin.js.map