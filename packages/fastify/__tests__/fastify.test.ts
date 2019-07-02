import { createMiddleware } from '../lib/fastify';
import fastify from 'fastify';
import jwt from 'jsonwebtoken';
const app = fastify();
const nunu = createMiddleware({
    secret: '秘钥',                    //秘钥
    verifyOptions: {                  // 验证token的参数
        algorithms: ['HS256']
    },
    unlessPath: ['/token']            // 排除的Path
});
app.use(nunu);

// 创建token
app.get('/token', () => {
    const token = jwt.sign(
        'payload: haha',
        '秘钥',
        { algorithm: 'HS256' }
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