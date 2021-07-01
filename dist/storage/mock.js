"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
// a mock storage class that just use js objects
// sql.js would be perfect for the job
var Mock = /** @class */ (function () {
    function Mock() {
        this.txs = [];
        // indexes
        this.primaryIndex = {};
        // accounting
        this.unspentUtxos = {};
        // only needed to handle the case when the input
        // is seen before the output (typically explorer
        // returning unordered tx within the same block)
        this.spentUtxos = {};
    }
    Mock.prototype.getLastTx = function (txFilter) {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                tx = lodash_1.findLast(this.txs, txFilter);
                return [2 /*return*/, tx];
            });
        });
    };
    Mock.prototype.getTx = function (address, id) {
        return __awaiter(this, void 0, void 0, function () {
            var index;
            return __generator(this, function (_a) {
                index = address + "-" + id;
                return [2 /*return*/, this.primaryIndex[index]];
            });
        });
    };
    // TODO: only expose unspentUtxos
    Mock.prototype.getAddressUnspentUtxos = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var indexAddress;
            return __generator(this, function (_a) {
                indexAddress = address.address;
                return [2 /*return*/, this.unspentUtxos[indexAddress]];
            });
        });
    };
    Mock.prototype.appendTxs = function (txs) {
        return __awaiter(this, void 0, void 0, function () {
            var lastLength;
            var _this = this;
            return __generator(this, function (_a) {
                lastLength = this.txs.length;
                txs.forEach(function (tx) {
                    var indexAddress = tx.address;
                    var index = indexAddress + "-" + tx.id;
                    // we reject already seen tx and tx pendings
                    if (_this.primaryIndex[index] || !tx.block) {
                        return;
                    }
                    _this.primaryIndex[index] = tx;
                    _this.unspentUtxos[indexAddress] = _this.unspentUtxos[indexAddress] || [];
                    _this.spentUtxos[indexAddress] = _this.spentUtxos[indexAddress] || [];
                    _this.txs.push(tx);
                    tx.outputs.forEach(function (output) {
                        if (output.address === tx.address) {
                            _this.unspentUtxos[indexAddress].push(output);
                        }
                    });
                    tx.inputs.forEach(function (input) {
                        if (input.address === tx.address) {
                            _this.spentUtxos[indexAddress].push(input);
                        }
                    });
                    _this.unspentUtxos[indexAddress] = _this.unspentUtxos[indexAddress].filter(function (output) {
                        var matchIndex = lodash_1.findIndex(_this.spentUtxos[indexAddress], function (input) { return input.output_hash === output.output_hash && input.output_index === output.output_index; });
                        if (matchIndex > -1) {
                            _this.spentUtxos[indexAddress].splice(matchIndex, 1);
                            return false;
                        }
                        return true;
                    });
                });
                return [2 /*return*/, this.txs.length - lastLength];
            });
        });
    };
    Mock.prototype.getUniquesAddresses = function (addressesFilter) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: to speed up, create more useful indexes in appendTxs
                return [2 /*return*/, lodash_1.uniqBy(lodash_1.filter(this.txs, addressesFilter).map(function (tx) { return ({
                        address: tx.address,
                        account: tx.account,
                        index: tx.index,
                    }); }), 'address')];
            });
        });
    };
    Mock.prototype.export = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.txs];
            });
        });
    };
    Mock.prototype.load = function (txs) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.appendTxs(txs)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Mock;
}());
exports.default = Mock;
//# sourceMappingURL=mock.js.map