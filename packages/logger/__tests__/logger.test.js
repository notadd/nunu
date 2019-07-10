"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("../lib/logger");
var fastify_1 = __importDefault(require("fastify"));
var app = fastify_1.default();
var logger = logger_1.createMiddleware({});
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
