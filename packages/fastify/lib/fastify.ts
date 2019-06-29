import { Plugin, FastifyInstance, FastifyError, Middleware } from 'fastify';
import jwt from 'jsonwebtoken';
import * as http from 'http'
export interface NunuOptions { }
/**
 * 插件
 * @param options 
 */
export function createPlugin<HttpServer = http.Server, HttpRequest = http.IncomingMessage, HttpResponse = http.ServerResponse, T = any>(
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
export function createMiddleware<HttpServer = http.Server, HttpRequest = http.IncomingMessage, HttpResponse = http.ServerResponse>(options: NunuOptions): Middleware<HttpServer, HttpRequest, HttpResponse> {
    return (req: HttpRequest, res: HttpResponse, callback: (err?: FastifyError) => void) => {
        let token = '123';
        let dtoken;
        try {
            dtoken = jwt.decode(token, {complete: true}) || {};
        } catch(err) {
            // todo
        }

        function getSecret(callback: any) {
            
        }

    }
}
