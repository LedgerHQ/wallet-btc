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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createXPUB = exports.compressPublicKey = exports.toHexInt = exports.toHexDigit = exports.encodeBase58Check = exports.parseHexString = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
var bitcoin = __importStar(require("bitcoinjs-lib"));
var bs58_1 = __importDefault(require("bs58"));
var lodash_1 = require("lodash");
function parseHexString(str) {
    var result = [];
    while (str.length >= 2) {
        result.push(parseInt(str.substring(0, 2), 16));
        // eslint-disable-next-line no-param-reassign
        str = str.substring(2, str.length);
    }
    return result;
}
exports.parseHexString = parseHexString;
function encodeBase58Check(vchIn) {
    // eslint-disable-next-line no-param-reassign
    vchIn = parseHexString(vchIn);
    var chksum = bitcoin.crypto.sha256(vchIn);
    chksum = bitcoin.crypto.sha256(chksum);
    chksum = chksum.slice(0, 4);
    var hash = vchIn.concat(Array.from(chksum));
    return bs58_1.default.encode(hash);
}
exports.encodeBase58Check = encodeBase58Check;
function toHexDigit(number) {
    var digits = '0123456789abcdef';
    // eslint-disable-next-line no-bitwise
    return digits.charAt(number >> 4) + digits.charAt(number & 0x0f);
}
exports.toHexDigit = toHexDigit;
function toHexInt(number) {
    return (
    // eslint-disable-next-line no-bitwise
    toHexDigit((number >> 24) & 0xff) +
        // eslint-disable-next-line no-bitwise
        toHexDigit((number >> 16) & 0xff) +
        // eslint-disable-next-line no-bitwise
        toHexDigit((number >> 8) & 0xff) +
        // eslint-disable-next-line no-bitwise
        toHexDigit(number & 0xff));
}
exports.toHexInt = toHexInt;
function compressPublicKey(publicKey) {
    var compressedKeyIndex;
    if (publicKey.substring(0, 2) !== '04') {
        // eslint-disable-next-line no-throw-literal
        throw 'Invalid public key format';
    }
    if (parseInt(publicKey.substring(128, 130), 16) % 2 !== 0) {
        compressedKeyIndex = '03';
    }
    else {
        compressedKeyIndex = '02';
    }
    var result = compressedKeyIndex + publicKey.substring(2, 66);
    return result;
}
exports.compressPublicKey = compressPublicKey;
function createXPUB(depth, fingerprint, childnum, chaincode, publicKey, network) {
    var xpub = toHexInt(network);
    xpub += lodash_1.padStart(depth.toString(16), 2, '0');
    xpub += lodash_1.padStart(fingerprint.toString(16), 8, '0');
    xpub += lodash_1.padStart(childnum.toString(16), 8, '0');
    xpub += chaincode;
    xpub += publicKey;
    return xpub;
}
exports.createXPUB = createXPUB;
//# sourceMappingURL=utils.js.map