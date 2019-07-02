
async function pro() {
    async function test1(): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(new Error('测试报错'))
        })
    }

    const pro1 = await test1();

    async function test2(): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(pro1)
        })
    }
    const pro2 = await test2();
    async function test3(): Promise<any> {
        return new Promise(() => {
            
        })
    }

}
