import * as fastify from 'fastify';
import * as http from 'http';
import { readFileSync } from 'fs';
import { sign } from 'jsonwebtoken';
import { createMiddleware } from '../lib/fastify';

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

let isRevoked = async (req: http.IncomingMessage, header: Object, payload: Object) => {
    if (payload && payload.hasOwnProperty('username')) {
        return false;
    }
    return true;
}

const app = fastify();
const nunu = createMiddleware({
    secret: getSecret,
    isRevoked: isRevoked,
    unlessPath: ['/token', '/favicon.ico'],
    verifyOptions: {
        algorithms: ['HS384'], //default HS256
    },
    credentialsRequired: false
});

app.use(nunu);

// 创建token
app.get('/token', (req, res) => {
    const token = sign(
        { 'username': 'zhangsan' },
        'zhangsan', // secret
        { algorithm: 'HS384', expiresIn: 60 * 5 }
    )
    res.send(token);
})

app.get('/hello', (req, res) => {
    res.send('hello world!')
})

app.listen(9000)