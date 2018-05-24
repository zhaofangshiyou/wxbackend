/*
 * create by zone on 2018/04/23
 * 往来账
 */

const router = require('koa-router')();
const config = require('../../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const MysqlModel = require('../../models/server.mysql.model')
const Station = MysqlModel.get('Station');
const commonUtil = require('../utils/common')
router.prefix(`/${config.VERSION}/backen/station`)
router.use(function (ctx, next) {
    // ctx.set('Access-Control-Allow-Origin':'*');
    return next();
});

router.use(function (ctx, next) {
    return next().catch((err) => {
        if (401 == err.status) {
            ctx.status = 401;
            ctx.json = {status: 401, msg: "认证错误。"}
        } else {
            throw err;
        }
    });
});

// router.use(koa_jwt({secret}))


router.post('/', async (ctx, next) => {//新增油站
    console.log(ctx.request.body)
    console.log(ctx.query)
    let {name, longitude, latitude, oil_gum_nums, province, city, address, avatar_url} = ctx.request.body
    console.log("==> post")
    let newStation = await Station.create({
        name: name  //油站名
        , avatar_url: avatar_url   //油站缩略图
        , longitude: longitude   //经度
        , latitude: latitude   //纬度
        , address: address   //详细地址
        , oil_gum_nums: oil_gum_nums   //油枪号
        , province: province   //省份
        , city: city   //城市
    })
    ctx.body = {
        status: 0
        , msg: "success"
        , data: {
            station: newStation
        }
    }
})




module.exports = router