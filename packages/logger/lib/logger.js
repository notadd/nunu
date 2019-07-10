"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var log4js_1 = __importDefault(require("log4js"));
var path_1 = require("path");
/**
 * 插件
 * @param options
 */
function createPlugin(options) {
    return function (instance, opts, callback) {
        // todo
    };
}
exports.createPlugin = createPlugin;
/**
 * 中间件
 * @param options
 */
function createMiddleware(options) {
    return function (req, res, callback) {
        // todo
        //  (req as any).headers
        var url = req.url, method = req.method;
        log4js_1.default.configure({
            categories: {
                default: {
                    appenders: ['nunu'],
                    level: 'info'
                }
            },
            appenders: {
                nunu: {
                    type: 'file',
                    filename: path_1.join(__dirname, 'log.txt'),
                }
            }
        });
        log4js_1.default.getLogger().info(JSON.stringify({ url: url, method: method, }));
        console.log(req.headers);
    };
}
exports.createMiddleware = createMiddleware;
