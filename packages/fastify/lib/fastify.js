"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jsonwebtoken_1 = require("jsonwebtoken");
const verify_error_1 = require("./error/verify.error");
const set = require("lodash.set");
/**
 * 插件
 * @param options
 */
function createPlugin(options) {
    return (instance, opts, callback) => {
    };
}
exports.createPlugin = createPlugin;
/**
 * 中间件
 * @param options
 */
function createMiddleware(options) {
    return (req, res, callback) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (req && req.originalUrl && options && options.unlessPath) {
            const url = options.unlessPath.find(val => val === req.originalUrl);
            if (url) {
                return callback();
            }
        }
        if (!options && !options.secret) {
            return callback(new verify_error_1.VerifyError('Secret should be set', 401));
        }
        if (req.method === 'OPTIONS') {
            callback();
        }
        let requestProperty = options.requestProperty || 'user';
        let credentialsRequired = typeof (options.credentialsRequired) === 'undefined' ? true : options.credentialsRequired;
        let token = '';
        if (options.getToken) {
            try {
                yield options.getToken(req).then(res => { token = res; });
            }
            catch (e) {
                return callback(new verify_error_1.VerifyError(e.message ? e.message : e, 401));
            }
        }
        else if (req.headers && req.headers.authorization) {
            let parts = req.headers.authorization.split(' ');
            if (parts.length == 2) {
                let scheme = parts[0];
                let credentials = parts[1];
                if (/^Bearer$/i.test(scheme)) {
                    token = credentials;
                }
            }
        }
        if (!token) {
            if (credentialsRequired) {
                return callback(new verify_error_1.VerifyError('Token cannot be empty', 401));
            }
            else {
                return callback();
            }
        }
        let dtoken = '';
        try {
            dtoken = jsonwebtoken_1.decode(token, { complete: true }) || {};
        }
        catch (err) {
            return callback(new verify_error_1.VerifyError(err.message, 401));
        }
        function getSecret() {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    if (typeof options.secret === 'string') {
                        resolve(options.secret);
                    }
                    else {
                        if (dtoken !== null && typeof (dtoken) !== 'string') {
                            resolve(options.secret(req, dtoken.header, dtoken.payload));
                        }
                    }
                });
            });
        }
        function verifyToken(secret) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    jsonwebtoken_1.verify(token, secret, options.verifyOptions, (err, revoked) => {
                        if (err) {
                            reject(new verify_error_1.VerifyError(err.message, 401));
                        }
                        else {
                            resolve(revoked);
                        }
                    });
                });
            });
        }
        function checkRevoked(vtoken) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    if (options.isRevoked) {
                        if (dtoken !== null && typeof (dtoken) !== 'string') {
                            options.isRevoked(req, dtoken.header, dtoken.payload).then(res => {
                                if (res) {
                                    resolve(vtoken);
                                }
                                reject(new verify_error_1.VerifyError(`This token has been revoked!`, 401));
                            });
                        }
                    }
                    else {
                        resolve(vtoken);
                    }
                });
            });
        }
        try {
            const secret = yield getSecret();
            const vtoken = yield verifyToken(secret);
            yield checkRevoked(vtoken).then(res => {
                set(req, requestProperty, res);
                callback();
            });
        }
        catch (e) {
            callback(e);
        }
    });
}
exports.createMiddleware = createMiddleware;
//# sourceMappingURL=fastify.js.map