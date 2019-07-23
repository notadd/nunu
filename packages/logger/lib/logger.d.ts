/// <reference types="node" />
import { Plugin, Middleware } from 'fastify';
import * as http from 'http';
export interface NunuOptions {
    categories: {
        [key: string]: {
            appenders: string[];
            level: string;
        };
    };
    appenders: {
        [key: string]: {
            type: string;
            filename: string;
        };
    };
}
export declare function createPlugin<HttpServer = http.Server, HttpRequest = http.IncomingMessage, HttpResponse = http.ServerResponse, T = any>(options: NunuOptions): Plugin<HttpServer, HttpRequest, HttpResponse, T>;
export declare function createMiddleware<HttpServer = http.Server, HttpRequest extends http.IncomingMessage = http.IncomingMessage, HttpResponse = http.ServerResponse>(options: NunuOptions): Middleware<HttpServer, HttpRequest, HttpResponse>;
