import { createMiddleware } from '../lib/fastify';
import fastify from 'fastify';
import jwt from 'jsonwebtoken';
const app = fastify();
const nunu = createMiddleware({
    secret: '秘钥',
    algorithms: ['HS256']
});
app.use(nunu)

app.get('/token', () => {
    // 创建token
    const token = jwt.sign(
        'payload: haha',
        '秘钥'
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