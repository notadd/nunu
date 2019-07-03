class VerifyException extends Error {
    constructor(message: string) {
        super(message)
    }
}
// setTimeout(function() {
//     console.log('TaskA, asynchronous');
// }, 0);
// console.log('TaskB, synchronize');

// async function test1(): Promise<void> {
//     console.log('TaskA, asyncchronous');
// }

// function test2() {
//     console.log('Task, synchronize');
// }
// test1()
// test2()
// let fun1 = function (callback: any) {
//     console.log('before callback');
//     (callback && typeof (callback) === 'function') && callback();
//     console.log('after callback');
// }

// let fun2 = function () {
//     let start = new Date().getTime();
//     while ((new Date().getTime() - start) < 3000) {
//     }
//     console.log("I'm callback");
// }
// fun1(fun2)

// request('test1.html', '', function(data1) {
//     console.log('第一次请求成功, 这是返回的数据:', data1);
//     request('test2.html', data1, function (data2) {
//         console.log('第二次请求成功, 这是返回的数据:', data2);
//         request('test3.html', data2, function (data3) {
//             console.log('第三次请求成功, 这是返回的数据:', data3);
//             //request... 继续请求
//         }, function(error3) {
//             console.log('第三次请求失败, 这是失败信息:', error3);
//         });
//     }, function(error2) {
//         console.log('第二次请求失败, 这是失败信息:', error2);
//     });
// }, function(error1) {
//     console.log('第一次请求失败, 这是失败信息:', error1);
// });

// let promise = new Promise(function(resolve, reject) {
//     console.log('before resolved');
//     resolve('success create promise');
//     console.log('after resolved');
//   });

//   promise.then(res =>
//     console.log(res)
//   );

//   console.log('outer');

// let promise = new Promise((resolve, reject) => {
//     reject(new Error('发生错误'));
// });
// promise.then(res => {
//     console.log(res)
// }).catch(err => {
//     console.log(err instanceof VerifyException)
// })

// let p1 = new Promise((resolve, reject) => {
//     setTimeout(reject, 6000, 'first reject')
// })

// let p2 = new Promise((resolve, reject) => {
//     resolve('second');
// })

// let p3 = new Promise((resolve, reject) => {
//     setTimeout(reject, 5000, 'third');
// })

// Promise.race([p1, p2, p3]).then(res => {
//     console.log(res)
// }).catch(err => {
//     console.log(err)
// })

// var promise = new Promise(function(resolve, reject) {
//     setTimeout(function() {
//         reject(new Error('12'))
//     }, 1000);
//   });

//   promise.catch(function(e) {
//     console.log(e);       //This is never called
//   });
   let map: Map < string, any > = new Map()
   map.set('123','456')
   const par = map.delete('123')

   console.log(par)