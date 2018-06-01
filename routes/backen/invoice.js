/*
 * create by zone on 2018/04/23
 * 开发票
 */
const router = require('koa-router')();
const config = require('../../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const oilModel = require('../../models/oil_model');
const stationModel = require('../../models/station_model');
const invoiceModel = require('../../models/invoice_model');
const userModel = require('../../models/user_model');
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

router.get('/invoice', async (ctx, next) => {
    try {
        let {card_no, page_num, num} = ctx.query

        num = (num && (parseInt(num)>=0)) ? parseInt(num) : 15;  //默认15条
        page_num = (page_num && (parseInt(page_num)>=1)) ? (parseInt(page_num)-1) : 0;  //默认从第一条开始

        let invoiceList = await invoiceModel.queryInvoiceList(card_no, page_num ,num)

        let invoiceCnt = await invoiceModel.queryInvoiceList(card_no, page_num ,0)

        ctx.body = {
            status : 0,
            msg : "success",
            data : {
                invoice_list : invoiceList,
                invoice_total : invoiceCnt.length
            }
        }

    } catch(error) {
        ctx.body = {
            status : 1,
            msg : "内部程序错误."
        }
    }
})

router.post('/invoice', async (ctx, next) => {
    try {
        let {cc_flow_id, user_id} = ctx.request.body
        let params = {cc_flow_id,user_id}

        if (commonUtil.reqParamsIsNull(params)) {
            ctx.body = {
                status : 2,
                msg : "传入参数错误." 
            }
            return ;
        }

        user_id = parseInt(user_id);
        let userInfo = await userModel.queryUserById(user_id)
        if (!userInfo || (userInfo.length != 1)) {
            ctx.body = {
                status : 5,
                msg : "传入的用户不存在."
            }
            return ;
        }

        //let operator = userInfo[0].name; //不存名字，名字可能会改
        let oilFlowInfo = await invoiceModel.queryOilFlowsByCCFlowId(cc_flow_id);
        if (!oilFlowInfo || (oilFlowInfo.length !=1)){
            ctx.body = {
                status : 3,
                msg : "该发票流水码不存在."
            }
            return ;
        }

        if (oilFlowInfo[0].is_invoicing == 1) {
            ctx.body = {
                status : 4,
                msg : "该流水码已经开过发票，请确认." 
            }
            return ;
        }

        let ret = await invoiceModel.addInvoice(cc_flow_id,user_id);
        ctx.body = {
            status : 0,
            msg : "success",
            data : ret
        }
    } catch (error){
        ctx.body = {
            status : 1,
            msg : "程序内部错误."
        }
    }
})



module.exports = router