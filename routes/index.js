const router = require('koa-router')()
const mysqlModel = require('../models/server.mysql.model')
const smsClient = require('./utils/sms')


//在云通信页面开通相应业务消息后，就能在页面上获得对应的queueName,不用填最后面一段
const queueName = 'Alicom-Queue-1092397003988387-'



router.get('/', async(ctx, next) => {
//发送短信
//     smsClient.sendSMS({
//     PhoneNumbers: '15768191995',
//     SignName: '阿里云短信测试专用',
//     TemplateCode: 'SMS_131365042',
//     TemplateParam: '{"code":"12345"}'
// }).then(function (res) {
//     let {Code} = res
//     if (Code === 'OK') {
//         //处理返回参数
//         console.log(res)
//     }
// }, function (err) {
//     console.log(err)
// })



await
ctx.render('index', {
    title: 'Hello Koa 2!'
})
})

router.get('/string', async(ctx, next) => {
    ctx.body = 'koa2 string'
})

router.get('/json', async(ctx, next) => {
    ctx.body = {
    title: 'koa2 json'
}
})

module.exports = router
