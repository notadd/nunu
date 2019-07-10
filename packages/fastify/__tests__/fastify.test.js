"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fastify_1 = require("../lib/fastify");
var fastify_2 = __importDefault(require("fastify"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var app = fastify_2.default();
var nunu = fastify_1.createMiddleware({
    secret: '秘钥',
    verifyOptions: {
        algorithms: ['HS256']
    },
    unlessPath: ['/token'] // 排除的Path
});
app.use(nunu);
// 创建token
app.get('/token', function () {
    var token = jsonwebtoken_1.default.sign('payload: haha', '秘钥', { algorithm: 'HS256' });
    return new Promise(function (resolve, reject) {
        return resolve(token);
    });
});
app.get('/hello', function () {
    return new Promise(function (resolve, reject) {
        return resolve('hello world');
    });
});
app.listen(9000);
