/*
 * create by zone on 2018/04/23
 * 兆方车上付
 */
const router = require('koa-router')();
const config = require('../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const MysqlModel = require('../models/server.mysql.model')
const Card = MysqlModel.get('Card');
const User = MysqlModel.get('User');
const wx = require('./utils/wx')
const request = require('request')
const superagent = require('superagent');
const parseString = require('xml2js').parseString; // xml转js对象
router.prefix(`/${config.VERSION}/pay`)

router.use(function (ctx, next) {
    return next().catch((err) => {
        if (401 == err.status) {
            ctx.status = 401;
            ctx.json = {status: 401, message: "认证错误。"}
        } else {
            throw err;
        }
    });
});


router.all('/callback', async (ctx, next) => {
    console.log("===================================================> get")
    console.log(ctx.params)
    console.log(ctx.request.body)
    console.log(ctx.query)
    let user = await User.findOne({
        where: {
            id: 2
        }
        , attributes: ['open_id']
    })
    ctx.body = tx.request.body + " " + ctx.query
})

// router.use(koa_jwt({secret}))
router.all('/unifiedorder', async (ctx, next) => {
    let param = ctx.query || ctx.params;
    let {openid} = ctx.query
    // let user = await User.findOne({
    //     where:{
    //         id:2
    //     }
    //     ,attributes:['open_id']
    // })
    // let openid = user.open_id;
    console.log(ctx.query)
    console.log(ctx.request.body)
    console.log("=======================>  " + openid)
    let spbill_create_ip = ctx.ip.replace(/::ffff:/, ''); // 获取客户端ip
    let body = '测试支付zone'; // 商品描述
    let notify_url = 'https://api.zfsyonline.com/v1/pay/callback' // 支付成功的回调地址  可访问 不带参数
    let nonce_str = await wx.getNonceStr(); // 随机字符串
    let out_trade_no = wx.getWxPayOrdrID(); // 商户订单号
    let total_fee = '1'; // 订单价格 单位是 分
    let timestamp = Math.round(new Date().getTime() / 1000); // 当前时间

    let bodyData = '<xml>';
    bodyData += '<appid>' + config.WX_APPID + '</appid>';  // 小程序ID
    bodyData += '<body>' + body + '</body>'; // 商品描述
    bodyData += '<mch_id>' + config.WX_MCHID + '</mch_id>'; // 商户号
    bodyData += '<nonce_str>' + nonce_str + '</nonce_str>'; // 随机字符串
    bodyData += '<notify_url>' + notify_url + '</notify_url>'; // 支付成功的回调地址 
    bodyData += '<openid>' + openid + '</openid>'; // 用户标识
    bodyData += '<out_trade_no>' + out_trade_no + '</out_trade_no>'; // 商户订单号
    bodyData += '<spbill_create_ip>' + spbill_create_ip + '</spbill_create_ip>'; // 终端IP
    bodyData += '<total_fee>' + total_fee + '</total_fee>'; // 总金额 单位为分
    bodyData += '<trade_type>JSAPI</trade_type>'; // 交易类型 小程序取值如下：JSAPI
    // 签名
    let sign = wx.paysignjsapi(
        config.WX_APPID,
        body,
        config.WX_MCHID,
        nonce_str,
        notify_url,
        openid,
        out_trade_no,
        spbill_create_ip,
        total_fee
    );
    bodyData += '<sign>' + sign + '</sign>';
    bodyData += '</xml>';

    console.log("拼接后发送给微信服务器的 xml 数据 ===================> ");
    console.log(bodyData);
    console.log("===================");

    // 微信小程序统一下单接口
    let urlStr = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
    let firstResult = await superagent
        .post(urlStr)
        .send(bodyData)

    let returnValue = {};
    let parseResult;
    console.log(firstResult.text)
    await parseString(firstResult.text, function (err, result) {
        console.dir(" 转化为 json 之后的返回数据： ==>  " + JSON.stringify(result));
        parseResult = result
    });
    if (parseResult.xml.return_code[0] == 'SUCCESS') {
        returnValue.msg = '操作成功';
        returnValue.status = '100';
        returnValue.appid = config.WX_APPID
        returnValue.out_trade_no = out_trade_no;  // 商户订单号
        // 小程序 客户端支付需要 nonceStr,timestamp,package,paySign  这四个参数
        returnValue.nonceStr = parseResult.xml.nonce_str[0]; // 随机字符串
        timestamp = Math.round(new Date().getTime() / 1000); // 当前时间
        returnValue.timestamp = timestamp.toString(); // 时间戳
        returnValue.package = 'prepay_id=' + parseResult.xml.prepay_id[0]; // 统一下单接口返回的 prepay_id 参数值
        let paySign = wx.getPaySign(config.WX_APPID, returnValue.nonceStr, returnValue.package, 'MD5', timestamp); // 签名
        // let paySign = parseResult.xml.sign[0]; // 签名
        returnValue.paySign = paySign;
        console.log(JSON.stringify(returnValue))


        ctx.body = JSON.stringify(returnValue);
    } else {
        returnValue.msg = parseResult.xml.return_msg[0];
        returnValue.status = '102';
        ctx.body = JSON.stringify(returnValue);
    }

    // console.log(abc.text);
    // ctx.body = parseResult
});


router.get('/:cardId', async (ctx, next) => {
    console.log("==> get")
    console.log(ctx.params.userId)
    ctx.body = ctx.params
})

router.post('/', async (ctx, next) => {//开卡
    console.log("==> post")

})
router.put('/:cardId', async (ctx, next) => {
    console.log("==> put")
    console.log(ctx.params.userId)
    ctx.body = ctx.params
})
router.delete('/:cardId', async (ctx, next) => {
    console.log("==> delete")
    console.log(ctx.params.userId)
    ctx.body = ctx.params
})


module.exports = router