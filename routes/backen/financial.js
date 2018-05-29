/*
 * create by miah on 2018/04/08
 * 消费查询
 */
const router = require('koa-router')();
const config = require('../../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const oilModel = require('../../models/oil_model');
const stationModel = require('../../models/station_model');
const financeModel = require('../../models/financial_model');
const commonUtil = require('../utils/common');

router.prefix(`/${config.VERSION}/backen`)

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

//查找消费列表
router.get('/consume/detail', async (ctx, next) => {
    try {
        let {province_id, station_id, begin_time, end_time, oil_id, vol_min,
            vol_max, pay_channel, page_num, num} = ctx.query

        let data = ctx.query;
        num = (num && (parseInt(num) >= 0)) ? parseInt(num) : 15;  //默认15条
        page_num = (page_num || (parseInt(page_num) >= 0)) ? (parseInt(page_num) - 1) : 0;  //默认从第一条开始

        data.num = num;
        data.page_num = page_num;

        let consumeList = await financeModel.queryConsumeDetailList(data,1);

        data.num = 0;
        let consumeListCnt = await financeModel.queryConsumeDetailList(data,1);

        let consumeTotal = await financeModel.queryConsumeDetailList(data,0);

        for (let i=0; i<consumeList.length; i++) {
            let time = consumeList[i].consume_time;
            time = time.toLocaleString();
            consumeList[i].consume_time = time;
        }

        ctx.body = {
            status: 0,
            msg : "success",
            data: {
                consume_list: consumeList,
                consume_list_cnt: consumeListCnt.length,
                consume_total: consumeTotal[0]
            }
        }
    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误."
        }
    }
})

//查找消费汇总
router.get('/consume', async (ctx, next) => {
    try {
        let {province_id, station_id, begin_time, end_time, oil_id, page_num, num, type} = ctx.query

        if ((!type) || (parseInt(type) !=1 && parseInt(type) !=2)) {
            ctx.body = {
                status : 2,
                msg : "传入参数错误."
            }
            return ;
        }

        let data = ctx.query;
        num = (num && (parseInt(num) >= 0)) ? parseInt(num) : 15;  //默认15条
        page_num = (page_num || (parseInt(page_num) >= 0)) ? (parseInt(page_num) - 1) : 0;  //默认从第一条开始

        data.num = num;
        data.page_num = page_num;

        let consumeList = await financeModel.queryConsumeList(data, type);
        data.num = 0;
        let consumeListCnt = await financeModel.queryConsumeList(data,type);

        let consumeTotal = await financeModel.queryConsumeList(data,0);

        for (let i=0; i<consumeList.length; i++) {
            let time = consumeList[i].currrent_time;
            time = time.toLocaleString();
            consumeList[i].currrent_time = time;
        }

        ctx.body = {
            status: 0,
            msg : "success",
            data: {
                consume_list: consumeList,
                consume_list_cnt: consumeListCnt.length,
                consume_total: consumeTotal[0]
            }
        }
    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误"
        }
    }
})

//查找充值明细
router.get('/recharge/detail', async (ctx, next) => {
    try {
        let {province_id, station_id, begin_time, end_time, card_no, page_num, num} = ctx.query

        let data = ctx.query;
        num = (num && (parseInt(num) >= 0)) ? parseInt(num) : 15;  //默认15条
        page_num = (page_num || (parseInt(page_num) >= 0)) ? (parseInt(page_num) - 1) : 0;  //默认从第一条开始

        if (card_no && card_no!= "") {
            let card_id = parseInt(card_no.slice(4));
            data.card_id = card_id
        }

        data.num = num;
        data.page_num = page_num;

        let rechargeList = await financeModel.queryRechargeDetailList(data,1);

        data.num = 0;
        let rechargeListCnt = await financeModel.queryRechargeDetailList(data,1);

        let rechargeTotal = await financeModel.queryRechargeDetailList(data,0);

        for (let i=0; i<rechargeList.length; i++) {
            let time = rechargeList[i].charge_time;
            time = time.toLocaleString();
            rechargeList[i].charge_time = time;
        }

        ctx.body = {
            status: 0,
            msg : "success",
            data: {
                recharge_list: rechargeList,
                recharge_list_cnt: rechargeListCnt.length,
                recharge_total: rechargeTotal[0]
            }
        }
    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误."
        }
    }

})

//查找充值汇总
router.get('/recharge', async (ctx, next) => {
    try {
        let {province_id, station_id, page_num, num} = ctx.query

        let data = ctx.query;
        num = (num && (parseInt(num) >= 0)) ? parseInt(num) : 15;  //默认15条
        page_num = (page_num || (parseInt(page_num) >= 0)) ? (parseInt(page_num) - 1) : 0;  //默认从第一条开始

        data.num = num;
        data.page_num = page_num;

        let rechargeList = await financeModel.queryRechargeList(data, 1);
        data.num = 0;
        let rechargeListCnt = await financeModel.queryRechargeList(data,1);

        let rechargeTotal = await financeModel.queryRechargeList(data,0);

        ctx.body = {
            status: 0,
            msg : "success",
            data: {
                recharge_list: rechargeList,
                recharge_list_cnt: rechargeListCnt.length,
                recharge_total: rechargeTotal[0]
            }
        }
    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误"
        }
    }
})

//往来账

module.exports = router