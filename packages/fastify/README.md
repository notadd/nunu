# `nunu`

## Description
nunu是一款验证JsonWebToken的中间件，它可以帮您验证JWT是否有效以及将JWT的Payload添加到到HTTP请求上，专注安全的同时方便您的操作。
## Usage

```
/**
 * 将中间件添加到应用中
 * @secret： 加密解密的秘钥（必填）
 * @unlessPath： 需要排除的Url（可选）
 * @verifyOptions： 验证JsonWebToken需要的参数（可选）
 * @requestProperty 将Jwt中的Payload信息存入Request请求中，如果为空nunu将默认为‘user’
 *         此处req.message即是解码后的Payload数据以供稍后的中间件用于授权和访问控制（可选）
 */
const app = fastify();
const nunu = createMiddleware({
    secret: '123456',
    unlessPath: ['/token'],
    requestProperty: 'message',
    verifyOptions: {
        algorithms: ['HS256'], //default HS256
    },
});
app.use(nunu);
app.listen(9000)
```
## Customize Verify
默认的验证策略是您需要在Reques发送Authorization的Header,其携带格式应为：
> Bearer Token

您可以根据您的需求自定义获取Token的策略
```
function getToken(req: http.IncomingMessage): sring{
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

    const nunu = createMiddleware({
    secret: '123456',
    unlessPath: ['/token'],
    // 添加自定义获取Token的函数
    getToken: getToken,
    verifyOptions: {
        algorithms: ['HS256'], //default HS256
    },
});
}
```
现在的携带格式就变为：
> Bearer===Token
