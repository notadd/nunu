import { FastifyError, FastifyInstance, Middleware, Plugin } from 'fastify';
import * as http from 'http';
import jwt from 'jsonwebtoken';
import set from 'lodash.set';

export type DecodeToken = { [key: string]: string } | null | string;
export type SecretCreater = (req: http.IncomingMessage, header: string, payload: string) => Promise<string>;
export type GetToken = (req: http.IncomingMessage) => string;

export interface NunuOptions {
    secret: string | SecretCreater;
    verifyOptions: VerifyOptions;
    credentialsRequired?: boolean;
    getToken?: GetToken;
    requestProperty?: string;
    isRevoked?: SecretCreater;
    unlessPath?: string[];
    getCache?: Cache;
}

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

export interface Cache {
    get<T>(key: string): T
    save<T>(key: string, val: T): void
    delete<T>(key: string): T
    clear(): void;
}

export class MemoryCache {
    static map: Map<string, any> = new Map()
    static get<T>(key: string): T {
        return this.map.get(key.toString());
    }
    static delete(key: string): boolean {
        return this.map.delete(key);
    }
    static save<T>(key: string, val: T): void {
        this.map.set(key, val);
    }
    static clear(): void {
        this.map.clear();
    }
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
        if (!options || !options.secret) {
            return callback(new Error('Secret should be set'));
        }
        if (req.method === 'OPTIONS') {
            callback();
        }

        let requestProperty = options.requestProperty || 'user';
        let credentialsRequired = typeof (options.credentialsRequired) === 'undefined' ? true : options.credentialsRequired;
        let token: string = '';

        if (options.getToken) {
            try {
                token = options.getToken(req);
            } catch (e) {
                return callback(e)
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
                return callback(new Error('Format is Authorization'));
            }
        }

        let dtoken: DecodeToken = '';
        try {
            dtoken = jwt.decode(token, { complete: true }) || {};
        } catch (err) {
            return callback(err);
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

        /**
         * 验证Token并增加缓存
         * @param secret 秘钥
         */
        async function verifyTokenAndCache(secret: string): Promise<object | string> {
            const res = options.getCache ? options.getCache.get(token) : MemoryCache.get<any | string>(token);
            if (res) {
                const time = new Date().getTime() / 1000;
                if (res.exp <= time) {
                    options.getCache ? options.getCache.delete(token) : MemoryCache.delete(token);
                    return Promise.reject('Token expired')
                } else {
                    return Promise.resolve(res);
                }
            } else {
                return new Promise((resolve, reject) => {
                    jwt.verify(token, secret, options.verifyOptions, (err, revoked) => {
                        if (err) {
                            reject(err)
                        } else {
                            options.getCache ? options.getCache.save<object | string>(token, revoked) :
                                MemoryCache.save<object | string>(token, revoked);
                            resolve(revoked);
                        }
                    });
                });
            }
        }

        /**
         * @param vtoken 要检测的token
         * @returns string 检测通过
         * @requires error
         */
        async function checkRevoked(vtoken: object | string): Promise<string | object> {
            return new Promise((resolve, reject) => {
                if (options.isRevoked) {
                    // 判断这个token是否被撤销
                    if (dtoken !== null && typeof (dtoken) !== 'string') {
                        options.isRevoked(req, dtoken.header, dtoken.payload).then(res => {
                            if (res) {
                                reject(new Error(`this token has been revoked!`))
                            }
                            resolve(vtoken);
                        });
                    }
                } else {
                    resolve(vtoken);
                }
            });
        }
        try {
            const secret = await getSecret();
            const vtoken = await verifyTokenAndCache(secret);
            await checkRevoked(vtoken).then(res => {
                set(req, requestProperty, res);
                callback();
            })
        } catch (e) {
            callback(e);
        }

    }
}

