/// <reference types="node" />
import { Middleware, Plugin } from 'fastify';
import * as http from 'http';
export declare type DecodeToken = {
    [key: string]: string;
} | null | string;
export declare type TokenCreater = (req: http.IncomingMessage, header: Object, payload: Object) => Promise<string>;
export declare type IsRevoked = (req: http.IncomingMessage, header: Object, payload: Object) => Promise<boolean>;
export declare type GetToken = (req: http.IncomingMessage) => Promise<string>;
export interface NunuOptions {
    secret: string | TokenCreater;
    verifyOptions: VerifyOptions;
    isRevoked?: IsRevoked;
    credentialsRequired?: boolean;
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
export declare function createPlugin<HttpServer = http.Server, HttpRequest extends http.IncomingMessage = http.IncomingMessage, HttpResponse = http.ServerResponse, T = any>(options: NunuOptions): Plugin<HttpServer, HttpRequest, HttpResponse, T>;
export declare function createMiddleware<HttpServer = http.Server, HttpRequest extends http.IncomingMessage = http.IncomingMessage, HttpResponse = http.ServerResponse>(options: NunuOptions): Middleware<HttpServer, HttpRequest, HttpResponse>;
