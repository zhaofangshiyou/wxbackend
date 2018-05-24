/**
 * Created by zone on 2018/2/10.
 */

const Redis = require('ioredis');
const config = require('../config/config.js')

// or: var redis = Redis();

// var redisOnPort6380 = new Redis(6380);
// var anotherRedis = new Redis(6380, '192.168.100.1');
// var unixSocketRedis = new Redis({ path: '/tmp/echo.sock' });
// var unixSocketRedis2 = new Redis('/tmp/echo.sock');
// var urlRedis = new Redis('redis://user:password@redis-service.com:6379/');
// var urlRedis2 = new Redis('//localhost:6379');
// var authedRedis = new Redis(6380, '192.168.100.1', { password: 'password' });


module.exports = function () {
    const redis=new Redis({
        host : config.REDIS_HOST,//安装好的redis服务器地址
        port : config.REDIS_PORT,　//端口
        prefix : 'sam:',//存诸前缀
        ttl : 60 * 60 * 23,//过期时间
        db: 0
    });
    return redis
}

//
// let redisConfig = {
//     port: config.REDIS_PORT,  //端口
//     host: config.REDIS_HOST,  //地址
//     //password: 'auth',  //访问密码
// }
//
//
// const ioredis = require('ioredis')  //引入 ioredis
// //根据环境变量选择导入的配置文件
//
// //连接redis
// let clientCreate = (config, callback_) => {
//     let redis = new ioredis(redisConfig)
//     redis.on('connect', () => {  //根据 connect 事件判断连接成功
//         console.log("connect success")
//         callback_(null, redis) //链接成功， 返回 redis 连接对象
//     })
//     redis.on('error', (err) => { //根据 error 事件判断连接失败
//         console.log("connect fail")
//
//         callback_(err, null)  //捕捉异常， 返回 error
//     })
// }
// let redisConn = (options) => {
//     let config = options || redisConfig
//     return new Promise((resolve, reject) => {  //返回API调用方 一个 promise 对象
//         clientCreate(config, (err, conn) => {
//             if (err) {
//                 reject(err)  //返回 err
//             }
//             resolve(conn) //返回连接对象
//         })
//     })
// }
// module.exports = redisConn