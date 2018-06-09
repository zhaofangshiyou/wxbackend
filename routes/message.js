/**
 * Created by zone on 2018/2/10.
 * 验证码获取，短信验证
 */
const router = require('koa-router')()
const mysqlModel = require('../models/server.mysql.model')
const smsClient = require('./utils/sms')
const Config = require('./../config/config')
const redisUtil = require('./utils/redis_util')


//在云通信页面开通相应业务消息后，就能在页面上获得对应的queueName,不用填最后面一段
const queueName = 'Alicom-Queue-1092397003988387-'


router.prefix(`/${Config.VERSION}/message`)

function radomNum() {//生成四位随机数
    let num1 = Math.floor(Math.random() * 10)
    console.log(num1)
    if (num1 == 0) {
        num1++
    }
    num1 = num1 * 1000
    let num2 = Math.floor(Math.random() * 10) * 100
    let num3 = Math.floor(Math.random() * 10) * 10
    let num4 = Math.floor(Math.random() * 10) * 1
    return num1 + num2 + num3 + num4;
}

router.post('/', async (ctx, next) => {//发送短信
    console.log("================>")
    let code = radomNum();
    let {mobile} = ctx.request.body
    console.log("==> " + JSON.stringify(ctx.request.body))
    if (mobile) {
        console.log("send message")
        // smsClient.sendSMS({
        //     PhoneNumbers: mobile,
        //     SignName: '兆方石油',
        //     TemplateCode: 'SMS_131365042',
        //     TemplateParam: `{"code":"${code}"}`
        // }).then(function (res) {
        //     let {Code} = res
        //     console.log('code ===========> ' + Code)
        //     if (Code === 'OK') {
        //         //处理返回参数
        //         redisUtil.set(mobile, code, 150)//单位为 秒
        //
        //         console.log(res)
        //         ctx.body = {
        //             status: 0
        //             , message: "success"
        //             , data: {}
        //         };
        //     }
        //
        // }, function (err) {
        //     console.log(err.Code)
        //     ctx.body = {
        //         status: 1
        //         , message: "error"
        //         , data: {}
        //     };
        // })

        try {
            let res = await smsClient.sendSMS({
                PhoneNumbers: mobile,
                SignName: '阿里云短信测试专用',
                TemplateCode: 'SMS_131365042',
                TemplateParam: `{"code":"${code}"}`
            });
            let {Code} = res;
            console.log('================>')
            console.log(res)
            console.log('================>')
            if (Code === 'OK') {
                redisUtil.set(mobile, code, 300)//单位为 秒
                ctx.body = {
                    status: 0
                    , msg: "success"
                    , data: {}
                };

            }
        } catch (error) {
            ctx.body = {
                status: 3
                , msg: "request more than 5 times"
            };
        }


    } else {
        ctx.body = {
            status: 2
            , msg: "please enter your mobile"
        };
    }

})


router.get('/', async (ctx, next) => {//验证短信
    try {
        let {mobile, code} = ctx.query
        console.log("==> " + JSON.stringify(ctx.request.body))
        if (mobile) {
            console.log("send message")
            let result = await smsClient.verifyCode(code, mobile)
            console.log('code => ' + code + ' result => ' + parseInt(result));
            if (!result) {//验证码错误
                ctx.body = {
                    status: 2
                    , msg: "verify code error"
                }
                return
            }
            ctx.body = {
                status: 0
                , msg: 'success'
                , data: {
                    verify: result
                }
            }
        } else {
            ctx.body = {//手机号错误
                status: 3
                , msg: 'mobile num error'
            }
        }

    } catch (e) {
        ctx.body = {
            status: 1
            , msg: 'error'
        }
    }
})

module.exports = router
