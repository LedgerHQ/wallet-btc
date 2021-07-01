"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var lodash_1 = require("lodash");
var eventemitter_1 = __importDefault(require("./utils/eventemitter"));
// names inside this class and discovery logic respect BIP32 standard
var Xpub = /** @class */ (function (_super) {
    __extends(Xpub, _super);
    function Xpub(_a) {
        var storage = _a.storage, explorer = _a.explorer, crypto = _a.crypto, xpub = _a.xpub, derivationMode = _a.derivationMode;
        var _this = _super.call(this) || this;
        _this.GAP = 20;
        _this.syncing = {};
        // need to be bigger than the number of tx from the same address that can be in the same block
        _this.txsSyncArraySize = 1000;
        _this.storage = storage;
        _this.explorer = explorer;
        _this.crypto = crypto;
        _this.xpub = xpub;
        _this.derivationMode = derivationMode;
        return _this;
    }
    Xpub.prototype.syncAddress = function (account, index) {
        return __awaiter(this, void 0, void 0, function () {
            var address, data, added, total, e_1, lastTx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        address = this.crypto.getAddress(this.derivationMode, this.xpub, account, index);
                        return [4 /*yield*/, this.whenSynced('address', address)];
                    case 1:
                        _a.sent();
                        data = {
                            type: 'address',
                            key: address,
                            account: account,
                            index: index,
                            address: address,
                        };
                        this.emitSyncing(data);
                        added = 0;
                        total = 0;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.fetchHydrateAndStoreNewTxs(address, account, index)];
                    case 4:
                        if (!(added = _a.sent())) return [3 /*break*/, 5];
                        total += added;
                        return [3 /*break*/, 3];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_1 = _a.sent();
                        this.emitSyncedFailed(data);
                        throw e_1;
                    case 7:
                        this.emitSynced(__assign(__assign({}, data), { total: total }));
                        return [4 /*yield*/, this.storage.getLastTx({
                                account: account,
                                index: index,
                            })];
                    case 8:
                        lastTx = _a.sent();
                        return [2 /*return*/, !!lastTx];
                }
            });
        });
    };
    Xpub.prototype.checkAddressesBlock = function (account, index) {
        return __awaiter(this, void 0, void 0, function () {
            var addressesResults;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(lodash_1.range(this.GAP).map(function (_, key) { return _this.syncAddress(account, index + key); }))];
                    case 1:
                        addressesResults = _a.sent();
                        return [2 /*return*/, lodash_1.some(addressesResults, function (lastTx) { return !!lastTx; })];
                }
            });
        });
    };
    Xpub.prototype.syncAccount = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var index, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.whenSynced('account', account.toString())];
                    case 1:
                        _a.sent();
                        this.emitSyncing({
                            type: 'account',
                            key: account,
                            account: account,
                        });
                        index = 0;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.checkAddressesBlock(account, index)];
                    case 4:
                        if (!_a.sent()) return [3 /*break*/, 5];
                        index += this.GAP;
                        return [3 /*break*/, 3];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_2 = _a.sent();
                        this.emitSyncedFailed({
                            type: 'account',
                            key: account,
                            account: account,
                        });
                        throw e_2;
                    case 7:
                        this.emitSynced({
                            type: 'account',
                            key: account,
                            account: account,
                            index: index,
                        });
                        return [2 /*return*/, index];
                }
            });
        });
    };
    // TODO : test fail case + incremental
    Xpub.prototype.sync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var account, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.whenSynced('all')];
                    case 1:
                        _a.sent();
                        this.emitSyncing({ type: 'all' });
                        account = 0;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.syncAccount(account)];
                    case 4:
                        if (!_a.sent()) return [3 /*break*/, 5];
                        account += 1;
                        return [3 /*break*/, 3];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_3 = _a.sent();
                        this.emitSyncedFailed({ type: 'all' });
                        throw e_3;
                    case 7:
                        this.emitSynced({ type: 'all', account: account });
                        return [2 /*return*/, account];
                }
            });
        });
    };
    Xpub.prototype.getXpubBalance = function () {
        return __awaiter(this, void 0, void 0, function () {
            var addresses;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.whenSynced('all')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getXpubAddresses()];
                    case 2:
                        addresses = _a.sent();
                        return [2 /*return*/, this.getAddressesBalance(addresses)];
                }
            });
        });
    };
    Xpub.prototype.getAccountBalance = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var addresses;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.whenSynced('account', account.toString())];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getAccountAddresses(account)];
                    case 2:
                        addresses = _a.sent();
                        return [2 /*return*/, this.getAddressesBalance(addresses)];
                }
            });
        });
    };
    Xpub.prototype.getAddressBalance = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var unspentUtxos;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.whenSynced('address', address.address)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.storage.getAddressUnspentUtxos(address)];
                    case 2:
                        unspentUtxos = _a.sent();
                        return [2 /*return*/, unspentUtxos.reduce(function (total, _a) {
                                var value = _a.value;
                                return total + value;
                            }, 0)];
                }
            });
        });
    };
    Xpub.prototype.getXpubAddresses = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.whenSynced('all')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.storage.getUniquesAddresses({})];
                }
            });
        });
    };
    Xpub.prototype.getAccountAddresses = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.whenSynced('account', account.toString())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.storage.getUniquesAddresses({ account: account })];
                }
            });
        });
    };
    Xpub.prototype.getNewAddress = function (account, gap) {
        return __awaiter(this, void 0, void 0, function () {
            var accountAddresses, lastIndex, index, address;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.whenSynced('account', account.toString())];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getAccountAddresses(account)];
                    case 2:
                        accountAddresses = _a.sent();
                        lastIndex = (lodash_1.maxBy(accountAddresses, 'index') || { index: -1 }).index;
                        if (lastIndex === -1) {
                            index = 0;
                        }
                        else {
                            index = lastIndex + gap;
                        }
                        address = {
                            address: this.crypto.getAddress(this.derivationMode, this.xpub, account, index),
                            account: account,
                            index: index,
                        };
                        return [2 /*return*/, address];
                }
            });
        });
    };
    Xpub.prototype.buildTx = function (destAddress, amount, fee, changeAddress, utxosToUse) {
        return __awaiter(this, void 0, void 0, function () {
            var addresses, unspentUtxos, _a, total, unspentUtxoSelected, i, txHexs, txs, inputs, associatedDerivations, outputs;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.whenSynced('all')];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.getXpubAddresses()];
                    case 2:
                        addresses = _b.sent();
                        _a = lodash_1.flatten;
                        return [4 /*yield*/, Promise.all(addresses.map(function (address) { return _this.storage.getAddressUnspentUtxos(address); }))];
                    case 3:
                        unspentUtxos = _a.apply(void 0, [_b.sent()]);
                        unspentUtxos = lodash_1.sortBy(unspentUtxos, 'value');
                        total = 0;
                        unspentUtxoSelected = [];
                        if (utxosToUse) {
                            unspentUtxoSelected = utxosToUse;
                            total = unspentUtxoSelected.reduce(function (totalacc, utxo) { return totalacc + utxo.value; }, 0);
                        }
                        else {
                            i = 0;
                            while (total < amount + fee) {
                                if (!unspentUtxos[i]) {
                                    throw new Error('amount bigger than the total balance');
                                }
                                total += unspentUtxos[i].value;
                                unspentUtxoSelected.push(unspentUtxos[i]);
                                i += 1;
                            }
                        }
                        return [4 /*yield*/, Promise.all(unspentUtxoSelected.map(function (unspentUtxo) { return _this.explorer.getTxHex(unspentUtxo.output_hash); }))];
                    case 4:
                        txHexs = _b.sent();
                        return [4 /*yield*/, Promise.all(unspentUtxoSelected.map(function (unspentUtxo) { return _this.storage.getTx(unspentUtxo.address, unspentUtxo.output_hash); }))];
                    case 5:
                        txs = _b.sent();
                        inputs = unspentUtxoSelected.map(function (utxo, index) { return [txHexs[index], utxo.output_index]; });
                        associatedDerivations = unspentUtxoSelected.map(function (utxo, index) { return [
                            txs[index].account,
                            txs[index].index,
                        ]; });
                        outputs = [
                            {
                                script: this.crypto.toOutputScript(destAddress),
                                value: amount,
                            },
                            {
                                script: this.crypto.toOutputScript(changeAddress),
                                value: total - amount - fee,
                            },
                        ];
                        return [2 /*return*/, {
                                inputs: inputs,
                                associatedDerivations: associatedDerivations,
                                outputs: outputs,
                            }];
                }
            });
        });
    };
    Xpub.prototype.broadcastTx = function (rawTxHex) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.explorer.broadcast(rawTxHex)];
            });
        });
    };
    // internal
    Xpub.prototype.getAddressesBalance = function (addresses) {
        return __awaiter(this, void 0, void 0, function () {
            var balances;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(addresses.map(function (address) { return _this.getAddressBalance(address); }))];
                    case 1:
                        balances = _a.sent();
                        return [2 /*return*/, balances.reduce(function (total, balance) { return (total || 0) + (balance || 0); }, 0)];
                }
            });
        });
    };
    // TODO : test the different syncing protection logic
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Xpub.prototype.emitSyncing = function (data) {
        this.syncing[data.type + "-" + data.key] = true;
        this.emit('syncing', data);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Xpub.prototype.emitSynced = function (data) {
        this.syncing[data.type + "-" + data.key] = false;
        this.emit('synced', data);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Xpub.prototype.emitSyncedFailed = function (data) {
        this.syncing[data.type + "-" + data.key] = false;
        this.emit('syncfail', data);
    };
    Xpub.prototype.whenSynced = function (type, key) {
        var _this = this;
        return new Promise(function (resolve) {
            if (!_this.syncing[type + "-" + key]) {
                resolve();
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                var handler_1 = function (evt) {
                    if (evt.type === type && evt.key === key) {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                        // @ts-ignore
                        _this.off('synced', handler_1);
                        resolve();
                    }
                };
                // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                // @ts-ignore
                _this.on('synced', handler_1);
            }
        });
    };
    Xpub.prototype.fetchHydrateAndStoreNewTxs = function (address, account, index) {
        return __awaiter(this, void 0, void 0, function () {
            var lastTx, txs, inserted;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storage.getLastTx({
                            account: account,
                            index: index,
                        })];
                    case 1:
                        lastTx = _a.sent();
                        return [4 /*yield*/, this.explorer.getAddressTxsSinceLastTxBlock(this.txsSyncArraySize, { address: address, account: account, index: index }, lastTx)];
                    case 2:
                        txs = _a.sent();
                        return [4 /*yield*/, this.storage.appendTxs(txs)];
                    case 3:
                        inserted = _a.sent();
                        return [2 /*return*/, inserted];
                }
            });
        });
    };
    return Xpub;
}(eventemitter_1.default));
exports.default = Xpub;
//# sourceMappingURL=xpub.js.map