import * as fastify from 'fastify';
import { readFileSync } from 'fs';
import * as http from 'http';
import { sign } from 'jsonwebtoken';
import { createMiddleware } from '../lib/fastify';

// let client = redis.createClient({
//     host: 'localhost',
//     port: 6379
// });

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
function getToken(req: http.IncomingMessage): Promise<string> {
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

// function getValue(key: string): Promise<string> {
//     return new Promise((resolve, reject) => {
//         client.get(key, (err, reply) => {
//             if (err) {
//                 return reject(err);
//             } else {
//                 return resolve(reply);
//             }
//         })
//     })
// }

function loadSecret(): string {
    const secret = readFileSync(__dirname + '/index', { encoding: 'utf-8' });
    return secret;
}


let getSecret = async (req: http.IncomingMessage, header: Object, payload: Object) => {
    if (payload && payload.hasOwnProperty('username')) {
        return payload['username'];
    }
    return '123456';
}

// let isRevoked = async (req: http.IncomingMessage, header: Object, payload: Object) => {
//     if (payload && payload.hasOwnProperty('id')) {
//         const val = await getValue(payload['id']);
//         if (val) {
//             return false;
//         }
//     }
//     return true;
// }

const app = fastify();
const nunu = createMiddleware({
    secret: getSecret,
    // isRevoked: isRevoked,
    unlessPath: ['/token', '/favicon.ico'],
    verifyOptions: {
        algorithms: ['HS384']
    }
});

app.use(nunu);

// 创建token
app.get('/token', (req, res) => {
    const token = sign(
        { 'username': 'zhangsan', 'id': 'userid' },
        'zhangsan', // secret
        { algorithm: 'HS384', expiresIn: 60 * 5 } //秒
    )
    res.send(token);
})

app.post('/hello', (req, res) => {
    console.log(req)
    res.send('hello world!')
})

app.listen(9000)