import { createMiddleware } from "../lib/logger";
import fastify from 'fastify';
const app = fastify();
const logger = createMiddleware({
});
app.use(logger)

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
 app.listen(9000)