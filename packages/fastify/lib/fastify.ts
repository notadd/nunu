import { Plugin, FastifyInstance, FastifyError } from 'fastify';
import * as http from 'http'
export interface NunuOptions { }
export function createNunu<HttpServer = http.Server, HttpRequest = http.IncomingMessage, HttpResponse = http.ServerResponse, T = any>(
    options: NunuOptions
): Plugin<HttpServer, HttpRequest, HttpResponse, T> {
    return (instance: FastifyInstance<HttpServer, HttpRequest, HttpResponse>, opts: T, callback: (err?: FastifyError) => void) => {
        
    }
}