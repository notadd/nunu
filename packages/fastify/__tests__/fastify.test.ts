import fastify from 'fastify';
import * as http from 'http';
import jwt from 'jsonwebtoken';
import { createMiddleware } from '../lib/fastify';

function getToken(req: http.IncomingMessage): string {
    let token: string;
    if (req.headers && req.headers.authorization) {
        let parts = req.headers.authorization.split('===');
        if (parts.length == 2) {
            let scheme = parts[0];
            let credentials = parts[1];
            if (/^Bearer$/i.test(scheme)) {
                // 获取到token
                token = credentials;
                return token;
            }
        }
    }
    return '';
}

const app = fastify();
const nunu = createMiddleware({
    secret: '123456',
    unlessPath: ['/token', '/favicon.ico'],
    requestProperty: 'message',
    verifyOptions: {
        algorithms: ['HS256'], //default HS256
    },
});
app.use(nunu);

declare global {
    namespace NuNu {
        interface Request {
            user: {
                username: string;
            }
        }
        interface Response { }
        interface Application { }
    }
}

// 创建token
app.get('/token', (req, res) => {
    const token = jwt.sign(
        {
            'username': 'zhangsan'
        },
        '123456',
        { expiresIn: 60 * 5 }
    )
    return new Promise((resolve, reject) => {
        return resolve(token);
    })
})

app.get('/hello', () => {
    return new Promise((resolve, reject) => {
        return resolve('hello world');
    })
})
app.listen(9000)