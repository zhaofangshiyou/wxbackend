/*
 * create by zone on 2018/04/08
 * 用于数据库被清空后，快速添加测试数据
 */
const router = require('koa-router')();
const config = require('../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const MysqlModel = require('../models/server.mysql.model')
const Station = MysqlModel.get('Station');
const OilFlow = MysqlModel.get('OilFlow');
const ChargeFlow = MysqlModel.get('ChargeFlow');
const ScoreFlow = MysqlModel.get('ScoreFlow');
const Card = MysqlModel.get('Card');
const User = MysqlModel.get('User');
const Region = MysqlModel.get('Region');
const OilInfo = MysqlModel.get('OilInfo');
router.prefix(`/${config.VERSION}/data`)

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

router.get('/', async (ctx, next) => {
    try {
        let station = Station.bulkCreate([
            {
                name: "华富加油站"   //油站名
                , oil_list: "92号、95号、98号"   //支持油品
                , longitude: "117.776602"   //经度
                , latitude: "30.926617"   //纬度
                , address: "安徽省铜陵市铜官区滨江大道中段"   //详细地址
                , oil_gum_nums: "10"   //油枪号
                , province: "安徽省"   //省份
                , city: "铜陵市"   //城市
            }
            , {
                name: "广阳加油站"   //油站名
                , oil_list: "92号、95号、98号"   //支持油品
                , longitude: "117.951281"   //经度
                , latitude: "30.342445"   //纬度
                , address: "安徽省黄山市太平湖朝阳村"   //详细地址
                , oil_gum_nums: "10"   //油枪号
                , province: "安徽省"   //省份
                , city: "黄山市"   //城市
            }
            , {
                name: "雨坛加油站"   //油站名
                , oil_list: "92号、95号、98号"   //支持油品
                , longitude: "117.951281"   //经度
                , latitude: "30.342445"   //纬度
                , address: "安徽省枞阳县雨坛乡雨坛村义小公路西侧"   //详细地址
                , oil_gum_nums: "10"   //油枪号
                , province: "安徽省"   //省份
                , city: "枞阳县"   //城市
            }
            , {
                name: "中兴加油站"   //油站名
                , oil_list: "92号、95号、98号"   //支持油品
                , longitude: "117.726732"   //经度
                , latitude: "30.635852"   //纬度
                , address: "安徽省池州市贵池区墩上街道"   //详细地址
                , oil_gum_nums: "10"   //油枪号
                , province: "安徽省"   //省份
                , city: "池州市"   //城市
            }
        ])

        let region = Region.bulkCreate([
            {
                type : "N",
                name : "中国",
                parent_id : 0
            }
            , {
                type : "P",
                name : "安徽省",
                parent_id :1
            }
            , {
                type : "P",
                name : "浙江省",
                parent_id : 1
            }
            , {
                type : "P",
                name : "广东省",
                parent_id : 1
            }
            ,{
                type : "C",
                name : "铜陵市",
                parent_id : 2
            }
            ,{
                type : "C",
                name : "黄山市",
                parent_id : 2
            }
            ,{
                type : "C",
                name : "池州市",
                parent_id : 2
            }
            ,{
                type : "C",
                name : "枞阳市",
                parent_id : 2
            }
        ])
        let oilInfo = OilInfo.bulkCreate([
            { name : "92号" },
            { name : "95号" },
            { name : "98号" },
            { name : "93号" },
            { name : "97号" }
        ])
        let oilFlow = OilFlow.bulkCreate([
            {
                user_id: 1     //用户ID
                , money: 123   //加油金额
                , oil_type: "92"  //优品类别
                , vol: 4  //升数，加油生数
                , pay_channel: "1"      //支付通道（1 - 个人卡，2 - 单位卡，3 - 微信支付）
                , station_id: 1      //油站ID
                , oil_gum_num: "1"      //油枪号
                , deduction_amount: 0      //优惠券抵扣金额
                , come_channel: ""     //入口通道
                , is_invoicing: "1"      //是否开过发票
            }
            , {
                user_id: 1     //用户ID
                , money: 83   //加油金额
                , oil_type: "95"  //优品类别
                , vol: 3  //升数，加油生数
                , pay_channel: "2"      //支付通道（1 - 个人卡，2 - 单位卡，3 - 微信支付）
                , station_id: 1      //油站ID
                , oil_gum_num: "1"      //油枪号
                , deduction_amount: 0      //优惠券抵扣金额
                , come_channel: ""     //入口通道
                , is_invoicing: "1"      //是否开过发票
            }
            , {
                user_id: 1     //用户ID
                , money: 183   //加油金额
                , oil_type: "95"  //优品类别
                , vol: 5  //升数，加油生数
                , pay_channel: "2"      //支付通道（1 - 个人卡，2 - 单位卡，3 - 微信支付）
                , station_id: 1      //油站ID
                , oil_gum_num: "1"      //油枪号
                , deduction_amount: 0      //优惠券抵扣金额
                , come_channel: ""     //入口通道
                , is_invoicing: "1"      //是否开过发票
            }
            , {
                user_id: 1     //用户ID
                , money: 283   //加油金额
                , oil_type: "95"  //优品类别
                , vol: 7  //升数，加油生数
                , pay_channel: "2"      //支付通道（1 - 个人卡，2 - 单位卡，3 - 微信支付）
                , station_id: 1      //油站ID
                , oil_gum_num: "1"      //油枪号
                , deduction_amount: 0      //优惠券抵扣金额
                , come_channel: ""     //入口通道
                , is_invoicing: "1"      //是否开过发票
            }
            , {
                user_id: 1     //用户ID
                , money: 83   //加油金额
                , oil_type: "98"  //优品类别
                , vol: 3  //升数，加油生数
                , pay_channel: "2"      //支付通道（1 - 个人卡，2 - 单位卡，3 - 微信支付）
                , station_id: 1      //油站ID
                , oil_gum_num: "1"      //油枪号
                , deduction_amount: 0      //优惠券抵扣金额
                , come_channel: ""     //入口通道
                , is_invoicing: "1"      //是否开过发票
            }
        ])
        let chargeFlow = await ChargeFlow.bulkCreate([
            {
                user_id: 1     //用户ID
                , money: 55   //充值金额
                , type: 1   //充值类型 <1 - 个人|2 - 单位>
                , deduction_amount: 0   //优惠券抵扣金额
            }
            , {
                user_id: 1     //用户ID
                , money: 85   //充值金额
                , type: 1   //充值类型 <1 - 个人|2 - 单位>
                , deduction_amount: 0   //优惠券抵扣金额
            }
            , {
                user_id: 1     //用户ID
                , money: 67   //充值金额
                , type: 1   //充值类型 <1 - 个人|2 - 单位>
                , deduction_amount: 0   //优惠券抵扣金额
            }
            , {
                user_id: 1     //用户ID
                , money: 67   //充值金额
                , type: 1   //充值类型 <1 - 个人|2 - 单位>
                , deduction_amount: 0   //优惠券抵扣金额
            }
            , {
                user_id: 1     //用户ID
                , money: 167   //充值金额
                , type: 2   //充值类型 <1 - 个人|2 - 单位>
                , deduction_amount: 0   //优惠券抵扣金额
            }
            , {
                user_id: 1     //用户ID
                , money: 89   //充值金额
                , type: 2   //充值类型 <1 - 个人|2 - 单位>
                , deduction_amount: 0   //优惠券抵扣金额
            }
        ])

        ctx.body = "add data success"
    } catch (error) {
        ctx.body = "add data fail ===> " + error
    }
})

router.get('/sq', async (ctx, next) => {
    try {
        let user = await User.findOne({
            where: {
                id: 1
            }
        })
        let card = await Card.create({
            user_id: user.id     //用户ID
            // , card_num: DataTypes.STRING      //卡号*
            , password: "123456asdf"      //办卡油站
            , person_balance: 1       //个人余额
            , company_balance: 2   //单位余额
            , score: 3  //积分
            , unit_card_type: "0"  //卡类型
        })
        let user2 = await User.findOne({
            where: {
                id: 1
            }
            , include: [{
                model: Card
            }]
        })

        // let user = await

        ctx.body = user2
    } catch (error) {
        console.log(error)
        ctx.body = "add data fail ===> " + error
    }
})


module.exports = router