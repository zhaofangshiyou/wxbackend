/**
 * Created by zone on 2018/2/12.
 * redis 辅助工具
 */
const redisConn = require('../../db/redis_connection')
const PREFIX = 'zf_'
class RedisTest {
    constructor() {
        this.redis = redisConn();
    }

    set(id, data, expire) {  //增/改 单位为 秒
        if (expire === null || expire === undefined) {
            this.redis.set(`${PREFIX}${id}`, JSON.stringify(data))
        } else {//ex 为过期时间，单位为 秒
            return this.redis.set(`${PREFIX}${id}`, JSON.stringify(data), 'ex', expire)
        }
    }

    get(id) {  //查
        return this.redis.get(`${PREFIX}${id}`)
        //     .then(resp => {
        //     console.log('get', resp)
        //     console.log('query success')
        //     return resp
        // }).catch(err => {
        //     console.log('err', err)
        //     console.log('query fail')
        // })
    }

    del(id) {
        return this.redis.del(`${PREFIX}${id}`)
    }

    multi(id, data) {
        this.redis.multi().set(`${PREFIX}${id}`, JSON.stringify(data))
            .get(`test-${id}`).exec((err, resp) => {
            if (err) {
                console.log('save fail')
                console.log('err', err)
            } else {
                console.log('save success')
                console.log('resp', resp)
            }
        })
    }
}
let redisUtil = new RedisTest();
module.exports = redisUtil
