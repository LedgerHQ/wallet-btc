"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bitcoin = __importStar(require("bitcoinjs-lib"));
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
var bufferutils_1 = require("bitcoinjs-lib/src/bufferutils");
var xpub_1 = __importDefault(require("xpub.js/dist/xpub"));
var ledger_v3_2_4_1 = __importDefault(require("xpub.js/dist/explorer/ledger.v3.2.4"));
var bitcoin_1 = __importDefault(require("xpub.js/dist/crypto/bitcoin"));
var mock_1 = __importDefault(require("xpub.js/dist/storage/mock"));
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
var coininfo_1 = __importDefault(require("coininfo"));
var lodash_1 = require("lodash");
var utils = __importStar(require("./utils"));
var WalletLedger = /** @class */ (function () {
    function WalletLedger(btc) {
        this.networks = {
            mainnet: coininfo_1.default.bitcoin.main.toBitcoinJS(),
            testnet: coininfo_1.default.bitcoin.test.toBitcoinJS(),
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.explorers = {
            ledgerv3: function (explorerURI, disableBatchSize) {
                return new ledger_v3_2_4_1.default({
                    explorerURI: explorerURI,
                    disableBatchSize: disableBatchSize,
                });
            },
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.accountStorages = {
            mock: function () { return new mock_1.default(); },
        };
        this.btc = btc;
    }
    WalletLedger.prototype.generateAccount = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var parentDerivation, accountDerivation, publicKeyParentCompressed, publicKeyParentCompressedHex, result, fingerprint, publicKeyAccountCompressed, childnum, network, xpub, storage, explorer;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.btc.getWalletPublicKey("" + params.path)];
                    case 1:
                        parentDerivation = _c.sent();
                        return [4 /*yield*/, this.btc.getWalletPublicKey(params.path + "/" + params.index + "'")];
                    case 2:
                        accountDerivation = _c.sent();
                        publicKeyParentCompressed = utils.compressPublicKey(parentDerivation.publicKey);
                        publicKeyParentCompressedHex = utils.parseHexString(publicKeyParentCompressed);
                        result = bitcoin.crypto.sha256(Buffer.from(publicKeyParentCompressedHex));
                        result = bitcoin.crypto.ripemd160(result);
                        fingerprint = ((result[0] << 24) | (result[1] << 16) | (result[2] << 8) | result[3]) >>> 0;
                        publicKeyAccountCompressed = utils.compressPublicKey(accountDerivation.publicKey);
                        childnum = (0x80000000 | parseInt(params.index, 10)) >>> 0;
                        network = this.networks[params.network];
                        xpub = utils.createXPUB(3, fingerprint, childnum, accountDerivation.chainCode, publicKeyAccountCompressed, network.bip32.public);
                        storage = (_a = this.accountStorages)[params.storage].apply(_a, params.storageParams);
                        explorer = (_b = this.explorers)[params.explorer].apply(_b, params.explorerParams);
                        return [2 /*return*/, {
                                params: params,
                                xpub: new xpub_1.default({
                                    storage: storage,
                                    explorer: explorer,
                                    crypto: new bitcoin_1.default({ network: network }),
                                    xpub: utils.encodeBase58Check(xpub),
                                    derivationMode: params.derivationMode,
                                }),
                            }];
                }
            });
        });
    };
    // eslint-disable-next-line class-methods-use-this
    WalletLedger.prototype.exportToSerializedAccount = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var txs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, account.xpub.storage.export()];
                    case 1:
                        txs = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, account), { xpub: {
                                    xpub: account.xpub.xpub,
                                    txs: txs,
                                } })];
                }
            });
        });
    };
    WalletLedger.prototype.importFromSerializedAccount = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var network, storage, explorer, xpub;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        network = this.networks[account.params.network];
                        storage = (_a = this.accountStorages)[account.params.storage].apply(_a, account.params.storageParams);
                        explorer = (_b = this.explorers)[account.params.explorer].apply(_b, account.params.explorerParams);
                        xpub = new xpub_1.default({
                            storage: storage,
                            explorer: explorer,
                            crypto: new bitcoin_1.default({ network: network }),
                            xpub: account.xpub.xpub,
                            derivationMode: account.params.derivationMode,
                        });
                        return [4 /*yield*/, xpub.storage.load(account.xpub.txs)];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, __assign(__assign({}, account), { xpub: xpub })];
                }
            });
        });
    };
    // eslint-disable-next-line class-methods-use-this
    WalletLedger.prototype.syncAccount = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, account.xpub.sync()];
            });
        });
    };
    // eslint-disable-next-line class-methods-use-this
    WalletLedger.prototype.getAccountNewReceiveAddress = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var address;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, account.xpub.getNewAddress(0, 1)];
                    case 1:
                        address = _a.sent();
                        return [2 /*return*/, address];
                }
            });
        });
    };
    // eslint-disable-next-line class-methods-use-this
    WalletLedger.prototype.getAccountNewChangeAddress = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var address;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, account.xpub.getNewAddress(1, 1)];
                    case 1:
                        address = _a.sent();
                        return [2 /*return*/, address];
                }
            });
        });
    };
    // eslint-disable-next-line class-methods-use-this
    WalletLedger.prototype.getAccountOperations = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var txs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, account.xpub.storage.export()];
                    case 1:
                        txs = _a.sent();
                        return [2 /*return*/, txs];
                }
            });
        });
    };
    // eslint-disable-next-line class-methods-use-this
    WalletLedger.prototype.getAccountUnspentUtxos = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var addresses, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, account.xpub.getXpubAddresses()];
                    case 1:
                        addresses = _b.sent();
                        _a = lodash_1.flatten;
                        return [4 /*yield*/, Promise.all(addresses.map(function (address) { return account.xpub.storage.getAddressUnspentUtxos(address); }))];
                    case 2: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    // eslint-disable-next-line class-methods-use-this
    WalletLedger.prototype.getAccountBalance = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, account.xpub.getXpubBalance()];
                    case 1:
                        balance = _a.sent();
                        return [2 /*return*/, balance];
                }
            });
        });
    };
    // eslint-disable-next-line class-methods-use-this
    WalletLedger.prototype.getAccountPendings = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var addresses, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, account.xpub.getXpubAddresses()];
                    case 1:
                        addresses = _b.sent();
                        _a = lodash_1.flatten;
                        return [4 /*yield*/, Promise.all(addresses.map(function (address) { return account.xpub.explorer.getPendings(address); }))];
                    case 2: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    WalletLedger.prototype.buildAccountTx = function (fromAccount, dest, amount, fee, unspentUtxoSelected) {
        return __awaiter(this, void 0, void 0, function () {
            var changeAddress, txinfos, length, buffer, bufferWriter, outputScriptHex, associatedKeysets, inputs, tx;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fromAccount.xpub.getNewAddress(1, 1)];
                    case 1:
                        changeAddress = _a.sent();
                        return [4 /*yield*/, fromAccount.xpub.buildTx(dest, amount, fee, changeAddress.address, unspentUtxoSelected)];
                    case 2:
                        txinfos = _a.sent();
                        length = txinfos.outputs.reduce(function (sum, output) {
                            return sum + 8 + output.script.length + 1;
                        }, 1);
                        buffer = Buffer.allocUnsafe(length);
                        bufferWriter = new bufferutils_1.BufferWriter(buffer, 0);
                        bufferWriter.writeVarInt(txinfos.outputs.length);
                        txinfos.outputs.forEach(function (txOut) {
                            bufferWriter.writeUInt64(txOut.value);
                            bufferWriter.writeVarSlice(txOut.script);
                        });
                        outputScriptHex = buffer.toString('hex');
                        associatedKeysets = txinfos.associatedDerivations.map(function (_a) {
                            var account = _a[0], index = _a[1];
                            return fromAccount.params.path + "/" + fromAccount.params.index + "'/" + account + "/" + index;
                        });
                        inputs = txinfos.inputs.map(function (_a) {
                            var txHex = _a[0], index = _a[1];
                            return [
                                _this.btc.splitTransaction(txHex, true),
                                index,
                                null,
                                null,
                            ];
                        });
                        return [4 /*yield*/, this.btc.createPaymentTransactionNew({
                                inputs: inputs,
                                associatedKeysets: associatedKeysets,
                                outputScriptHex: outputScriptHex,
                                // changePath: `${fromAccount.params.path}/${fromAccount.params.index}'/${changeAddress.account}/${changeAddress.index}`,
                                additionals: [],
                            })];
                    case 3:
                        tx = _a.sent();
                        return [2 /*return*/, tx];
                }
            });
        });
    };
    // eslint-disable-next-line class-methods-use-this
    WalletLedger.prototype.broadcastTx = function (fromAccount, tx) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fromAccount.xpub.broadcastTx(tx)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.data.result];
                }
            });
        });
    };
    return WalletLedger;
}());
exports.default = WalletLedger;
//# sourceMappingURL=ledger.js.map