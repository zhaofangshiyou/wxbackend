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
const consumeModel = require('../../models/consume_model');
const commonUtil = require('../utils/common');

router.prefix(`/${config.VERSION}/backen/consume`)

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
router.get('/detail', async (ctx, next) => {
    try {
        let {
            province_id, station_id, begin_time, end_time, oil_id, vol_min,
            vol_max, pay_channel, page_num, num
        } = ctx.query

        let data = ctx.query;
        num = (num && (parseInt(num) >= 0)) ? parseInt(num) : 15;  //默认15条
        page_num = (page_num || (parseInt(page_num) >= 0)) ? (parseInt(page_num) - 1) : 0;  //默认从第一条开始

        data.num = num;
        data.page_num = page_num;

        let consumeList = await consumeModel.queryConsumeDetailList(data,1);

        data.num = 0;
        let consumeListCnt = await consumeModel.queryConsumeDetailList(data,1);

        let consumeTotal = await consumeModel.queryConsumeDetailList(data,0);

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
router.get('/', async (ctx,next) => {
    try {

    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误"
        }
    }
})

module.exports = router