import { writeFileSync } from 'fs';

/**
 * @status todo/finish
 * @author jiansheng    
 * @solver 解决者 
 * @description 这是一个输出字符串到文件的方法
 * @param {string} content 接收的字符串
 * @returns {void} 这是一个返回值
 * @example
 * ```ts
 * testWrite('测试内容');
 * ```
 */
function testWrite(content: string) {
    writeFileSync('index.txt', content);
}

testWrite('测试内容');