import { createMiddleware, MemoryCache } from '../lib/fastify';
import fastify from 'fastify';
import jwt from 'jsonwebtoken';

let secret: string = '123456';

function updateSecret(secrecy: string): void {
    MemoryCache.clear();
    secret = secrecy;
}

const app = fastify();
const nunu = createMiddleware({
    secret: secret,
    unlessPath: ['/token', '/favicon.ico'],
    verifyOptions: {
        algorithms: ['HS256'], //default HS256
    },
});
app.use(nunu);

// 创建token
app.get('/token', (req, res) => {
    const token = jwt.sign(
        { 'username': 'zhangsan' },
        secret,
        { expiresIn: 60 }
    )
    return Promise.resolve(token);
})

app.get('/hello', () => {
    return Promise.resolve('hello,world!')
})
app.listen(9000)