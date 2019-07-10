"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fastify = require("fastify");
const fs_1 = require("fs");
const jsonwebtoken_1 = require("jsonwebtoken");
const redis = require("redis");
const fastify_1 = require("../lib/fastify");
let client = redis.createClient({
    host: 'localhost',
    port: 6379
});
/**
 class RedisCache implements FastifyCache {
     async get<T>(key: string): Promise<string> {
         return new Promise((resolve, reject) => {
             client.get(key, (err, reply) => {
                 if (err) {
                     return reject(err);
                    } else {
                        return resolve(reply);
                    }
                })
            })
        }
        save<T>(key: string, val: string): void | Promise<void> {
            client.set(key, val);
        }
        delete(key: string): boolean {
            return client.del(key);
        }
        clear(): boolean {
            return client.flushall();
        }
    }
    */
function getToken(req) {
    if (req.headers && req.headers.authorization) {
        let parts = req.headers.authorization.split('=');
        if (parts.length == 2) {
            let scheme = parts[0];
            let credentials = parts[1];
            if (/^Bearer$/i.test(scheme)) {
                // 获取到token
                return Promise.resolve(credentials);
            }
        }
    }
    return Promise.reject(new Error('jwt　error'));
}
function getValue(key) {
    return new Promise((resolve, reject) => {
        client.get(key, (err, reply) => {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(reply);
            }
        });
    });
}
function loadSecret() {
    const secret = fs_1.readFileSync(__dirname + '/index', { encoding: 'utf-8' });
    return secret;
}
let getSecret = (req, header, payload) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    if (payload && payload.hasOwnProperty('username')) {
        return payload['username'];
    }
    return '123456';
});
let isRevoked = (req, header, payload) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    if (payload && payload.hasOwnProperty('id')) {
        const val = yield getValue(payload['id']);
        if (val) {
            return false;
        }
    }
    return true;
});
const app = fastify();
const nunu = fastify_1.createMiddleware({
    secret: getSecret,
    isRevoked: isRevoked,
    unlessPath: ['/token', '/favicon.ico'],
    verifyOptions: {
        algorithms: ['HS384'],
    }
});
app.use(nunu);
// 创建token
app.get('/token', (req, res) => {
    const token = jsonwebtoken_1.sign({ 'username': 'zhangsan', 'id': 'userid' }, 'zhangsan', // secret
    { algorithm: 'HS384', expiresIn: 60 * 5 } //秒
    );
    res.send(token);
});
app.post('/hello', (req, res) => {
    res.send('hello world!');
});
app.listen(9000);
//# sourceMappingURL=fastify.test.js.map