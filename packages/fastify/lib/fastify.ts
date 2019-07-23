import { FastifyError, FastifyInstance, Middleware, Plugin } from 'fastify';
import * as http from 'http';
import { decode, verify } from 'jsonwebtoken';
import set = require('lodash.set');

export type DecodeToken = { [key: string]: string } | null | string;
export type TokenCreater = (req: http.IncomingMessage, header: Object, payload: Object) => Promise<string>;
export type IsRevoked = (req: http.IncomingMessage, header: Object, payload: Object) => Promise<boolean>;
export type GetToken = (req: http.IncomingMessage) => Promise<string>;

export interface NunuOptions {
    secret: string | TokenCreater;
    verifyOptions: VerifyOptions;
    isRevoked?: IsRevoked;
    requestProperty?: string;
    unlessPath?: string[];
    getToken?: GetToken;
}

export interface VerifyOptions {
    algorithms?: string[];
    audience?: string | RegExp | Array<string>;
    clockTimestamp?: number;
    clockTolerance?: number;
    issuer?: string | string[];
    ignoreExpiration?: boolean;
    ignoreNotBefore?: boolean;
    jwtid?: string;
    subject?: string;
}

/**
 * 插件
 * @param options 
 */
export function createPlugin<HttpServer = http.Server, HttpRequest extends http.IncomingMessage = http.IncomingMessage, HttpResponse = http.ServerResponse, T = any>(
    options: NunuOptions): Plugin<HttpServer, HttpRequest, HttpResponse, T> {
    return (instance: FastifyInstance<HttpServer, HttpRequest, HttpResponse>, opts: T, callback: (err?: FastifyError) => void) => {

    }
}

/**
 * 中间件
 * @param options 
 */
export function createMiddleware<HttpServer = http.Server, HttpRequest extends http.IncomingMessage = http.IncomingMessage, HttpResponse = http.ServerResponse>(options: NunuOptions): Middleware<HttpServer, HttpRequest, HttpResponse> {
    return async (req: HttpRequest, res: HttpResponse, callback: (err?: FastifyError) => void) => {
        if (req && (req as any).originalUrl && options && options.unlessPath) {
            const url = options.unlessPath.find(val => val === (req as any).originalUrl)
            if (url) {
                return callback();
            }
        }
        if (!options && !options.secret) {
            return callback();
        }
        if (req.method === 'OPTIONS') {
            callback();
        }

        let requestProperty = options.requestProperty || 'user';
        let token: string = '';

        if (options.getToken) {
            try {
                await options.getToken(req).then(res => { token = res });
            } catch (e) {
                return callback();
            }
        } else if (req.headers && req.headers.authorization) {
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
            return callback();
        }

        let dtoken: DecodeToken = '';
        try {
            dtoken = decode(token, { complete: true }) || {};
        } catch (err) {
            return callback();
        }

        async function getSecret(): Promise<string> {
            return new Promise((resolve, reject) => {
                if (typeof options.secret === 'string') {
                    resolve(options.secret);
                } else {
                    if (dtoken !== null && typeof (dtoken) !== 'string') {
                        resolve(options.secret(req, dtoken.header, dtoken.payload));
                    }
                }
            });
        }

        async function verifyToken(secret: string): Promise<object | string> {
            return new Promise((resolve, reject) => {
                verify(token, secret, options.verifyOptions, (err, revoked) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(revoked);
                    }
                });
            });
        }

        async function checkRevoked(vtoken: object | string): Promise<string | object> {
            return new Promise((resolve, reject) => {
                if (options.isRevoked) {
                    if (dtoken !== null && typeof (dtoken) !== 'string') {
                        options.isRevoked(req, dtoken.header, dtoken.payload).then(res => {
                            if (res) {
                                resolve(vtoken);
                            }
                            reject();
                        });
                    }
                } else {
                    resolve(vtoken);
                }
            });
        }

        try {
            const secret = await getSecret();
            const vtoken = await verifyToken(secret);
            await checkRevoked(vtoken).then(res => {
                set(req, requestProperty, res);
                callback();
            })
        } catch (e) {
            callback();
        }

    }
}

