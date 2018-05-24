/*
 * create by zone on 2018/04/08
 * 油站的增删改查
 */
const router = require('koa-router')();
const config = require('../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const MysqlModel = require('../models/server.mysql.model')
const Station = MysqlModel.get('Station');
const commonUtil = require('./utils/common')
router.prefix(`/${config.VERSION}/station`)

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

router.get('/', async (ctx, next) => {//获取油站列表，并返回距离当前地点最近的地址。
    console.log(ctx.query);
    let {lat, lon} = ctx.query;
    console.log("==> " + lat + "  " + lon)
    let stations = await Station.findAll();
    console.log(ctx.params.stationId)
    // {latitude: 22.52291, longitude: 114.05454}, {latitude: 30.926617, longitude: 117.776602}
    stations.forEach(function (station, index) {
        let distance = commonUtil.getDistance({latitude: Number(lat), longitude: Number(lon)}, {
            latitude: station.latitude,
            longitude: station.longitude
        });
        console.log(station.latitude)
        console.log(station.longitude)
        console.log(" distance ==> " + distance)

        station['dataValues']['distance'] = distance
        console.log(station)
    })
    ctx.body = ctx.body = {
        status: 0
        , msg: "success"
        , data: {
            stations: stations
        }
    };
})


router.post('/', async (ctx, next) => {//新增油站
    console.log(ctx.request.body)
    console.log(ctx.query)
    let {name, avatar_url, longitude, latitude, oil_gum_nums, province, city, address} = ctx.request.body

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
router.put('/:stationId', async (ctx, next) => {
    console.log("==> put")
    console.log(ctx.params.stationId)
    ctx.body = ctx.params
})
router.delete('/:stationId', async (ctx, next) => {
    console.log("==> delete")
    console.log(ctx.params.stationId)
    ctx.body = ctx.params
})


module.exports = router