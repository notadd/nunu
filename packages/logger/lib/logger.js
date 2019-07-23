"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log4js = require("log4js");
/**
 * 插件
 * @param options
 */
function createPlugin(options) {
    return (instance, opts, callback) => {
        // todo
    };
}
exports.createPlugin = createPlugin;
/**
 * 中间件
 * @param options
 */
function createMiddleware(options) {
    return (req, res, callback) => {
        // todo
        //  (req as any).headers
        const { url, method } = req;
        //配置文件
        log4js.configure(options);
        log4js.getLogger().info(JSON.stringify({ url, method, }));
        callback();
    };
}
exports.createMiddleware = createMiddleware;
//# sourceMappingURL=logger.js.map