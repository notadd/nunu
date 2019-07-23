"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../lib/logger");
const fastify = require("fastify");
const app = fastify();
const logger = logger_1.createMiddleware({
    categories: {
        default: {
            appenders: [
                "appender"
            ], level: "info"
        },
        categorie: {
            appenders: [
                "appender",
            ], level: "info"
        }
    },
    appenders: {
        appender: { type: "file", filename: (__dirname) + "/log.txt" }
    }
});
app.use(logger);
// app.get('/token', () => {
//     // 创建token5
//     const token = jwt.sign(
//         'user:wahaha',
//         '123456',
//         {
//             algorithm: 'HS256'
//         } 
//     )
//     return new Promise((resolve, reject) => {
//         return resolve(token);
//     })
// })
// app.get('/hello', () => { 
//     return new Promise((resolve, reject) => {
//         return resolve('hello world');
//     })
// })
app.listen(9000);
//# sourceMappingURL=logger.test.js.map