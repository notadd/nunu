import { FastifyError, FastifyInstance, Middleware, Plugin } from 'fastify';
import * as http from 'http';
import jwt from 'jsonwebtoken';
import set from 'lodash.set';
import { ValidationError } from './error/validation.error';

export interface VerifyOptions {
    algorithms?: string[];
    audience?: string | RegExp | Array<string | RegExp>;
    clockTimestamp?: number;
    clockTolerance?: number;
    issuer?: string | string[];
    ignoreExpiration?: boolean;
    ignoreNotBefore?: boolean;
    jwtid?: string;
    subject?: string;
}
export type SecretCreater = (req: http.IncomingMessage, header: any, payload: any) => Promise<string>;
export type GetToken = (req: http.IncomingMessage) => Promise<any>;
export interface NunuOptions {
    secret: string | SecretCreater;
    credentialsRequired?: boolean;
    userProperty?: string;
    requestProperty?: string;
    isRevoked?: SecretCreater;
    [property: string]: any;
    verifyOptions: VerifyOptions;
    unlessPath?: string[];
}
/**
 * 插件
 * @param options 
 */
export function createPlugin<HttpServer = http.Server, HttpRequest extends http.IncomingMessage = http.IncomingMessage, HttpResponse = http.ServerResponse, T = any>(
    options: NunuOptions
): Plugin<HttpServer, HttpRequest, HttpResponse, T> {
    return (instance: FastifyInstance<HttpServer, HttpRequest, HttpResponse>, opts: T, callback: (err?: FastifyError) => void) => {
        // todo
    }
}
/**
 * 中间件
 * @param options 
 */
export function createMiddleware<HttpServer = http.Server, HttpRequest extends http.IncomingMessage = http.IncomingMessage, HttpResponse = http.ServerResponse>(options: NunuOptions): Middleware<HttpServer, HttpRequest, HttpResponse> {
    return async (req: HttpRequest | any, res: HttpResponse, callback: (err?: FastifyError) => void) => {
        if (req && req.originalUrl && options && options.unlessPath) {
            const url = options.unlessPath.find(val => val === req.originalUrl)
            if (url) {
                callback();
                return;
            }
        }
        if (!options || !options.secret) {
            callback(new ValidationError(401, 'secret should be set'));
        };
        let requestProperty = options.requestProperty || options.userProperty || 'user';
        let credentialsRequired = typeof (options.credentialsRequired) === 'undefined' ? true : options.credentialsRequired;
        let token: any;

        if (req.method === 'OPTIONS') {
            callback();
        }
        if (options.getToken) {
            try {
                token = options.getToken(req);
            } catch (e) {
                callback(e)
            }
        } else if (req.headers && req.headers.authorization) {
            let parts = req.headers.authorization.split(' ');
            if (parts.length == 2) {
                let scheme = parts[0];
                let credentials = parts[1];
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

        let dtoken: any;
        try {
            // 返回解码后的有效负载，而不验证签名是否有效。
            dtoken = jwt.decode(token, { complete: true }) || {};
        } catch (err) {
            return callback(err);
        }

        async function getSecret(): Promise<any> {
            return new Promise((resolve, reject) => {
                if (typeof options.secret === 'string') {
                    resolve(options.secret);
                } else {
                    resolve(options.secret(req, dtoken.header, dtoken.payload));
                }
            })
        }

        async function verifyToken(secret: string): Promise<object | string> {
            return new Promise((resolve, reject) => {
                jwt.verify(token, secret, options.verifyOptions, (err, revoked) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(revoked)
                    }
                })
            })
        }


        /**
         * 
         * @param vtoken 要检测的token
         * @returns string 检测通过
         * @requires error
         */
        async function checkRevoked(vtoken: object | string): Promise<string | object> {
            return new Promise((resolve, reject) => {
                if (options.isRevoked) {
                    // 判断这个token是否被撤销
                    options.isRevoked(req, dtoken.header, dtoken.payload).then(res => {
                        if (res) {
                            reject(new Error(`this token has been revoked!`))
                        }
                        resolve(vtoken);
                    })
                } else {
                    resolve(vtoken);
                }
            })
        }
        try {
            const secret = await getSecret();
            const vtoken = await verifyToken(secret);
            await checkRevoked(vtoken).then(res => {
                // 数据添加到req
                set(req, requestProperty, res);
                callback();
            })
        } catch (e) {
            callback(e);
        }

    }
}

