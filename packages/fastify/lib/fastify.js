"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var lodash_set_1 = __importDefault(require("lodash.set"));
/**
 * 插件
 * @param options
 */
function createPlugin(options) {
    return function (instance, opts, callback) {
        // todo
    };
}
exports.createPlugin = createPlugin;
/**
 * 中间件
 * @param options
 */
function createMiddleware(options) {
    var _this = this;
    return function (req, res, callback) { return __awaiter(_this, void 0, void 0, function () {
        function getSecret() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            if (typeof options.secret === 'string') {
                                resolve(options.secret);
                            }
                            else {
                                resolve(options.secret(req, dtoken.header, dtoken.payload));
                            }
                        })];
                });
            });
        }
        function verifyToken(secret) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            jsonwebtoken_1.default.verify(token, secret, options.verifyOptions, function (err, revoked) {
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    resolve(revoked);
                                }
                            });
                        })];
                });
            });
        }
        /**
         *
         * @param vtoken 要检测的token
         * @returns string 检测通过
         * @requires error
         */
        function checkRevoked(vtoken) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            if (options.isRevoked) {
                                // 判断这个token是否被撤销
                                options.isRevoked(req, dtoken.header, dtoken.payload).then(function (res) {
                                    if (res) {
                                        reject(new Error("this token has been revoked!"));
                                    }
                                    resolve(vtoken);
                                });
                            }
                            else {
                                resolve(vtoken);
                            }
                        })];
                });
            });
        }
        var url, requestProperty, credentialsRequired, token, parts, scheme, credentials, dtoken, secret, vtoken, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (req && req.originalUrl && options && options.unlessPath) {
                        url = options.unlessPath.find(function (val) { return val === req.originalUrl; });
                        if (url) {
                            callback();
                            return [2 /*return*/];
                        }
                    }
                    if (!options || !options.secret) {
                        callback(new Error('secret should be set'));
                    }
                    ;
                    requestProperty = options.requestProperty || options.userProperty || 'user';
                    credentialsRequired = typeof (options.credentialsRequired) === 'undefined' ? true : options.credentialsRequired;
                    if (req.method === 'OPTIONS') {
                        callback();
                    }
                    if (options.getToken) {
                        try {
                            token = options.getToken(req);
                        }
                        catch (e) {
                            callback(e);
                        }
                    }
                    else if (req.headers && req.headers.authorization) {
                        parts = req.headers.authorization.split(' ');
                        if (parts.length == 2) {
                            scheme = parts[0];
                            credentials = parts[1];
                            if (/^Bearer$/i.test(scheme)) {
                                // 获取到token
                                token = credentials;
                            }
                        }
                    }
                    if (!token) {
                        if (credentialsRequired) {
                            callback(new Error('Format is Authorization: Bearer [token]'));
                        }
                    }
                    try {
                        // 返回解码后的有效负载，而不验证签名是否有效。
                        dtoken = jsonwebtoken_1.default.decode(token, { complete: true }) || {};
                    }
                    catch (err) {
                        return [2 /*return*/, callback(err)];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, getSecret()];
                case 2:
                    secret = _a.sent();
                    return [4 /*yield*/, verifyToken(secret)];
                case 3:
                    vtoken = _a.sent();
                    return [4 /*yield*/, checkRevoked(vtoken).then(function (res) {
                            // 数据添加到req
                            lodash_set_1.default(req, requestProperty, res);
                            callback();
                        })];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    callback(e_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
}
exports.createMiddleware = createMiddleware;
