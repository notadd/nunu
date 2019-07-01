import { FastifyError, FastifyInstance, Middleware, Plugin } from 'fastify';
import * as http from 'http';
import jwt from 'jsonwebtoken';
import set from 'lodash.set';
export type SecretCreater = (req: http.IncomingMessage, header: any, payload: any) => Promise<string>;
export type GetToken = (req: http.IncomingMessage) => Promise<any>;
export interface NunuOptions {
    secret: string | SecretCreater;
    userProperty?: string;
    credentialsRequired?: boolean;
    requestProperty?: string;
    isRevoked?: SecretCreater;
    [property: string]: any;
    algorithms: string[];
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
    return async (req: HttpRequest, res: HttpResponse, callback: (err?: FastifyError) => void) => {
        // 判断options是否存在，以及options里面有没有传入秘钥，没有抛异常
        if (!options || !options.secret) {
            throw new Error('secret should be set')
        };
        let _resultProperty: any;
        let _requestProperty = options.requestProperty || options.userProperty || 'user';
        let credentialsRequired = typeof (options.credentialsRequired) === 'undefined' ? true : options.credentialsRequired;

        let token: any;
        // 跨域预检查请求头
        if (req.method === 'OPTIONS') {
            callback();
        }
        // 获取token
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
                return callback(new Error('Format is Authorization: Bearer [token]'));
            }
        }

        let dtoken: any;
        try {
            // 返回解码后的有效负载，而不验证签名是否有效。
            dtoken = jwt.decode(token, { complete: true }) || {};
        } catch (err) {
            return callback(err);
        }

        // get secret
        async function getSecret(): Promise<any> {
            return new Promise((resolve, reject) => {
                if (typeof options.secret === 'string') {
                    resolve(options.secret);
                } else {
                    resolve(options.secret(req, dtoken.header, dtoken.payload));
                }
            })
        }
        const secret = await getSecret();

        async function verifyToken(secret: string): Promise<object | string> {
            return new Promise((resolve, reject) => {
                jwt.verify(token, secret, {}, (err, revoked) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(revoked)
                })
            })
        }
        const vtoken = await verifyToken(secret)

        /**
         * 
         * @param vtoken 要检测的token
         * @returns string 检测通过
         * @requires error
         */
        async function checkRevoked(vtoken: object | string): Promise<string | object> {
            return new Promise((resolve, reject) => {
                if (options.isRevoked) {
                    // 判断这个token是否被使用
                    options.isRevoked(req, dtoken.header, dtoken.payload).then(res => {
                        if (res) {
                            reject(new Error(`this token has been revoked!`))
                        }
                        resolve(vtoken);
                    }).catch(res => reject(res))
                } else {
                    resolve(vtoken);
                }
            })
        }
        await checkRevoked(vtoken).then(response => {
            // 数据添加到req
            if (_requestProperty) {
                set(req, _requestProperty, response);
                callback();
            }
        }).catch(res => {
            callback(res);
        })




    }
}

