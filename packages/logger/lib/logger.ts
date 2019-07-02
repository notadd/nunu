import { Plugin, FastifyInstance, FastifyError, Middleware } from 'fastify';
import * as http from 'http'
import log4js, { Logger, levels } from 'log4js';
import { join } from 'path';


export interface NunuOptions { 
   [categories:string]:object
  
  

}
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
export function createMiddleware<HttpServer = http.Server, HttpRequest extends http.IncomingMessage = http.IncomingMessage, HttpResponse = http.ServerResponse>(options: NunuOptions): Middleware<HttpServer, HttpRequest, HttpResponse> {
    return (req: HttpRequest, res: HttpResponse, callback: (err?: FastifyError) => void) => {

        // todo
        //  (req as any).headers
        const { url, method  } = req;

        //配置文件
        log4js.configure({
            categories: {
                default: {
                    appenders: ['nunu'],
                    level: 'info',
                }
            },
            appenders: {
                nunu: {
                    type: 'file',
                    filename: join(__dirname, 'log.txt'),
                }
            }
        });
        log4js.getLogger().info(JSON.stringify({ url, method, }));
        callback(); 
    }
}
