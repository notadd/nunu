import fastify from 'fastify';
import jwt from 'jsonwebtoken';
import { createMiddleware, MemoryCache } from '../lib/fastify';

function updateSecret(secrecy: string = '123456'): string {
    MemoryCache.clear();
    return secrecy;
}

const app = fastify();
const nunu = createMiddleware({
    secret: updateSecret(),
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
        updateSecret(),
        { expiresIn: 60 * 5 }
    )
    res.send(token);
})

app.get('/hello', (req, res) => {
    res.send('hello world!')
})

app.get('/update', (req, res) => {
    updateSecret(req.query.secret)
    res.send('秘钥更换成功');
})
app.listen(9000)