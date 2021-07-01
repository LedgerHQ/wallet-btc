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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bitcoin_1 = __importDefault(require("./bitcoin"));
var Digibyte = /** @class */ (function (_super) {
    __extends(Digibyte, _super);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function Digibyte(_a) {
        var network = _a.network;
        var _this = 
        // missing bip32 info in coininfo network for digibyte, we fill it mannually
        // https://electrum.readthedocs.io/en/latest/xpub_version_bytes.html
        _super.call(this, { network: network }) || this;
        _this.network.bip32 = { public: 0x0488b21e, private: 0x0488ade4 };
        return _this;
    }
    return Digibyte;
}(bitcoin_1.default));
exports.default = Digibyte;
//# sourceMappingURL=digibyte.js.map