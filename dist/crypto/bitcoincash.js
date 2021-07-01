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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bch = __importStar(require("bitcore-lib-cash"));
var bchaddrjs_1 = __importDefault(require("bchaddrjs"));
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
var address_1 = require("bitcoinjs-lib/src/address");
// a mock explorer class that just use js objects
var BitcoinCash = /** @class */ (function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function BitcoinCash(_a) {
        var network = _a.network;
        this.DerivationMode = {
            BCH: 'BCH',
        };
        this.network = network;
    }
    // Based on https://github.com/go-faast/bitcoin-cash-payments/blob/54397eb97c7a9bf08b32e10bef23d5f27aa5ab01/index.js#L63-L73
    // eslint-disable-next-line
    BitcoinCash.prototype.getLegacyBitcoinCashAddress = function (xpub, account, index) {
        var node = new bch.HDPublicKey(xpub);
        var child = node.derive(account).derive(index);
        var address = new bch.Address(child.publicKey, bch.Networks.livenet);
        var addrstr = address.toString().split(':');
        if (addrstr.length === 2) {
            return bchaddrjs_1.default.toCashAddress(bchaddrjs_1.default.toLegacyAddress(addrstr[1]));
        }
        throw new Error("Unable to derive cash address for " + address);
    };
    // get address given an address type
    BitcoinCash.prototype.getAddress = function (derivationMode, xpub, account, index) {
        return this.getLegacyBitcoinCashAddress(xpub, account, index);
    };
    // infer address type from its syntax
    //
    // TODO: improve the prefix matching: make the expected prefix
    // correspond to the actual type (currently, a `ltc1` prefix
    // could match a native Bitcoin address type for instance)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BitcoinCash.prototype.getDerivationMode = function (address) {
        return this.DerivationMode.BCH;
    };
    BitcoinCash.prototype.toOutputScript = function (address) {
        return address_1.toOutputScript(address, this.network);
    };
    return BitcoinCash;
}());
exports.default = BitcoinCash;
//# sourceMappingURL=bitcoincash.js.map