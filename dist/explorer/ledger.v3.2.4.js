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
var axios_1 = __importDefault(require("axios"));
var axios_retry_1 = __importDefault(require("axios-retry"));
var https = __importStar(require("https"));
var eventemitter_1 = __importDefault(require("../utils/eventemitter"));
// an Live explorer V3 class
var LedgerV3Dot2Dot4 = /** @class */ (function (_super) {
    __extends(LedgerV3Dot2Dot4, _super);
    function LedgerV3Dot2Dot4(_a) {
        var explorerURI = _a.explorerURI, disableBatchSize = _a.disableBatchSize;
        var _this = _super.call(this) || this;
        _this.disableBatchSize = false;
        _this.client = axios_1.default.create({
            baseURL: explorerURI,
            // uses max 20 keep alive request in parallel
            httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 20 }),
        });
        // 3 retries per request
        axios_retry_1.default(_this.client, { retries: 3 });
        if (disableBatchSize) {
            _this.disableBatchSize = disableBatchSize;
        }
        return _this;
    }
    LedgerV3Dot2Dot4.prototype.broadcast = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                url = '/transactions/send';
                return [2 /*return*/, this.client.post(url, { tx: tx })];
            });
        });
    };
    LedgerV3Dot2Dot4.prototype.getTxHex = function (txId) {
        return __awaiter(this, void 0, void 0, function () {
            var url, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "/transactions/" + txId + "/hex";
                        this.emit('fetching-transaction-tx', { url: url, txId: txId });
                        return [4 /*yield*/, this.client.get(url)];
                    case 1:
                        res = (_a.sent()).data;
                        return [2 /*return*/, res[0].hex];
                }
            });
        });
    };
    LedgerV3Dot2Dot4.prototype.getPendings = function (address, nbMax) {
        return __awaiter(this, void 0, void 0, function () {
            var txs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAddressTxsSinceLastTxBlock(nbMax || 1000, address, undefined)];
                    case 1:
                        txs = _a.sent();
                        return [2 /*return*/, txs.filter(function (tx) { return !tx.block; })];
                }
            });
        });
    };
    LedgerV3Dot2Dot4.prototype.getAddressTxsSinceLastTxBlock = function (batchSize, address, lastTx) {
        return __awaiter(this, void 0, void 0, function () {
            var params, url, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            // eslint-disable-next-line @typescript-eslint/camelcase
                            no_token: 'true',
                        };
                        if (!this.disableBatchSize) {
                            // eslint-disable-next-line @typescript-eslint/camelcase
                            params.batch_size = batchSize;
                        }
                        if (lastTx) {
                            // eslint-disable-next-line @typescript-eslint/camelcase
                            params.block_hash = lastTx.block.hash;
                        }
                        url = "/addresses/" + address.address + "/transactions";
                        this.emit('fetching-address-transaction', { url: url, params: params });
                        return [4 /*yield*/, this.client.get(url, {
                                params: params,
                            })];
                    case 1:
                        res = (_a.sent()).data;
                        // faster than mapping
                        res.txs.forEach(function (tx) {
                            // no need to keep that as it changes
                            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                            // @ts-ignore
                            // eslint-disable-next-line no-param-reassign
                            delete tx.confirmations;
                            // eslint-disable-next-line no-param-reassign
                            tx.account = address.account;
                            // eslint-disable-next-line no-param-reassign
                            tx.index = address.index;
                            // eslint-disable-next-line no-param-reassign
                            tx.address = address.address;
                            tx.outputs.forEach(function (output) {
                                // eslint-disable-next-line @typescript-eslint/camelcase,no-param-reassign
                                output.output_hash = tx.id;
                            });
                        });
                        this.emit('fetched-address-transaction', { url: url, params: params, txs: res.txs });
                        return [2 /*return*/, res.txs];
                }
            });
        });
    };
    return LedgerV3Dot2Dot4;
}(eventemitter_1.default));
exports.default = LedgerV3Dot2Dot4;
//# sourceMappingURL=ledger.v3.2.4.js.map