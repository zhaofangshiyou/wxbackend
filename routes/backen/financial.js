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
const modelUtils = require('../../models/utils/common')
const ExcelMap = require('../../config/excel_map')

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
        let {act, province_id, station_id, begin_time, end_time, oil_id, vol_min,
            vol_max, pay_channel, page_num, num} = ctx.query

        let data = ctx.query;
        num = (num && (parseInt(num) >= 0)) ? parseInt(num) : 15;  //默认15条
        page_num = (page_num && (parseInt(page_num) >= 1)) ? (parseInt(page_num) - 1) : 0;  //默认从第一条开始

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

        if (act && act == "export") {
            let filename = 'consume_detail_list_' + (new Date().toLocaleDateString());
            let headers = [];
            let data = [];
            let mvParam = ["pay_type"]
            if (consumeListCnt && consumeListCnt.length >0) {
                for (let k in consumeListCnt[0]) {
                    if (commonUtil.strInArray(k,mvParam)){
                        continue;
                    } else {
                        headers.push(k)    
                    }
                } 
                for (let i=0; i<consumeListCnt.length; i++) {
                    let time = consumeListCnt[i].consume_time;
                    time = time.toLocaleString();
                    consumeListCnt[i].consume_time = time;
                }
                data = consumeListCnt 

                let languageCH = ExcelMap.languageCH();
                if (languageCH) {
                    let consumeDetailMap = ExcelMap.consumeDetail()
                    headers = commonUtil.getExcelHeader(headers,consumeDetailMap)
                    data = commonUtil.getExcelData(consumeDetailMap,data) 
                }
            }
    
            let buf = await modelUtils.toExcelBuf(headers, data)
            ctx.set('Content-disposition', 'attachment; filename=' + filename + '.xlsx');
            ctx.set('Content-type', 'application/xlsx');
            ctx.body = buf
        } else {
            ctx.body = {
                status: 0,
                msg : "success",
                data: {
                    consume_list: consumeList,
                    consume_list_cnt: consumeListCnt.length,
                    consume_total: consumeTotal[0]
                }
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
        let {act, province_id, station_id, begin_time, end_time, 
            oil_id, page_num, num, type} = ctx.query

        if ((!type) || (parseInt(type) !=1 && parseInt(type) !=2)) {
            ctx.body = {
                status : 2,
                msg : "传入参数错误."
            }
            return ;
        }

        let data = ctx.query;
        num = (num && (parseInt(num) >= 0)) ? parseInt(num) : 15;  //默认15条
        page_num = (page_num && (parseInt(page_num) >= 1)) ? (parseInt(page_num) - 1) : 0;  //默认从第一条开始

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

        if (act && act == "export") {
            let filename = 'consume_list_' + (new Date().toLocaleDateString());
            let headers = [];
            let data = [];
            
            if (consumeListCnt && consumeListCnt.length >0) {
                for (let k in consumeListCnt[0]) {
                   headers.push(k)    
                } 
                for (let i=0; i<consumeListCnt.length; i++) {
                    let time = consumeListCnt[i].currrent_time;
                    time = time.toLocaleString();
                    consumeListCnt[i].currrent_time = time;
                }
                data = consumeListCnt
                
                let languageCH = ExcelMap.languageCH();
                if (languageCH) {
                    let consumeMap = ExcelMap.consume()
                    headers = commonUtil.getExcelHeader(headers,consumeMap)
                    data = commonUtil.getExcelData(consumeMap,data) 
                }
            }
    
            let buf = await modelUtils.toExcelBuf(headers, data)
            ctx.set('Content-disposition', 'attachment; filename=' + filename + '.xlsx');
            ctx.set('Content-type', 'application/xlsx');
            ctx.body = buf
        } else {
            ctx.body = {
                status: 0,
                msg : "success",
                data: {
                    consume_list: consumeList,
                    consume_list_cnt: consumeListCnt.length,
                    consume_total: consumeTotal[0]
                }
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
        let {act, province_id, station_id, begin_time, end_time, card_no, page_num, num} = ctx.query

        let data = ctx.query;
        num = (num && (parseInt(num) >= 0)) ? parseInt(num) : 15;  //默认15条
        page_num = (page_num && (parseInt(page_num) >= 1)) ? (parseInt(page_num) - 1) : 0;  //默认从第一条开始

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

        if (act && act == "export") {
            let filename = 'recharge_detail_list_' + (new Date().toLocaleDateString());
            let headers = [];
            let data = [];
        
            if (rechargeListCnt && rechargeListCnt.length >0) {
                for (let k in rechargeListCnt[0]) {
                   headers.push(k)    
                } 
                for (let i=0; i<rechargeListCnt.length; i++) {
                    let time = rechargeListCnt[i].charge_time;
                    time = time.toLocaleString();
                    rechargeListCnt[i].charge_time = time;
                }
                data = rechargeListCnt 

                let languageCH = ExcelMap.languageCH();
                if (languageCH) {
                    let rechargeDetailMap = ExcelMap.rechargeDetail()
                    headers = commonUtil.getExcelHeader(headers,rechargeDetailMap)
                    data = commonUtil.getExcelData(rechargeDetailMap,data) 
                }
            }
    
            let buf = await modelUtils.toExcelBuf(headers, data)
            ctx.set('Content-disposition', 'attachment; filename=' + filename + '.xlsx');
            ctx.set('Content-type', 'application/xlsx');
            ctx.body = buf
        } else {
            ctx.body = {
                status: 0,
                msg : "success",
                data: {
                    recharge_list: rechargeList,
                    recharge_list_cnt: rechargeListCnt.length,
                    recharge_total: rechargeTotal[0]
                }
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
        let {act, province_id, station_id, page_num, num} = ctx.query

        let data = ctx.query;
        num = (num && (parseInt(num) >= 0)) ? parseInt(num) : 15;  //默认15条
        page_num = (page_num && (parseInt(page_num) >= 1)) ? (parseInt(page_num) - 1) : 0;  //默认从第一条开始

        data.num = num;
        data.page_num = page_num;

        let rechargeList = await financeModel.queryRechargeList(data, 1);
        data.num = 0;
        let rechargeListCnt = await financeModel.queryRechargeList(data,1);

        let rechargeTotal = await financeModel.queryRechargeList(data,0);

        if (act && act == "export") {
            let filename = 'recharge_list_' + (new Date().toLocaleDateString());
            let headers = [];
            let data = [];
        
            if (rechargeListCnt && rechargeListCnt.length >0) {
                for (let k in rechargeListCnt[0]) {
                   headers.push(k)    
                } 
                for (let i=0; i<rechargeListCnt.length; i++) {
                    let time = rechargeListCnt[i].charge_time;
                    time = time.toLocaleString();
                    rechargeListCnt[i].charge_time = time;
                }
                data = rechargeListCnt 

                let languageCH = ExcelMap.languageCH();
                if (languageCH) {
                    let rechargeMap = ExcelMap.recharge()
                    headers = commonUtil.getExcelHeader(headers,rechargeMap)
                    data = commonUtil.getExcelData(rechargeMap,data) 
                }
            }
    
            let buf = await modelUtils.toExcelBuf(headers, data)
            ctx.set('Content-disposition', 'attachment; filename=' + filename + '.xlsx');
            ctx.set('Content-type', 'application/xlsx');
            ctx.body = buf
        } else {
            ctx.body = {
                status: 0,
                msg : "success",
                data: {
                    recharge_list: rechargeList,
                    recharge_list_cnt: rechargeListCnt.length,
                    recharge_total: rechargeTotal[0]
                }
            }
        }
    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误"
        }
    }
})

//往来账,只计算了在使用的油站
router.get('/accounts', async (ctx, next) => {
    try {
        let {act, begin_time, end_time, oil_id} = ctx.query;

        let data = ctx.query;
        let acc = await financeModel.queryAccountList(data);
        let stationInfo = await stationModel.queryAllStationInfo();
        
        let header = [];
        //第一行，标题行
        header.push({"prop":"station_name","label":"收入\\支出"});
        if (stationInfo && (stationInfo.length >0)){
            for (let i=0; i<stationInfo.length; i++) {
                let row = {}
                row.prop = stationInfo[i].id.toString();
                row.label = stationInfo[i].name;
                header.push(row);
            }
        }

        let accRow = [];
        /*
        if (!acc || (acc.length == 0)) {
            ctx.body = {
                status : 0,
                msg : "success",
                data : {
                    header:header,
                    accounts_list :accRow
                }
            }
            return;
        }
*/
        //第一列，与标题行对应
        for (let i=0; i<header.length; i++) {
            let row = {};
            if (header[i].prop != "station_name") {
                row["station_name"] = header[i].label ;
                row["station_id"] = parseInt(header[i].prop);
            } else {
                continue;
            }
            accRow.push(row)
        }
      
        //if (acc && acc.length > 0){
        for (let i=0; i<header.length; i++){
            let prop = header[i].prop  //列
            if (prop == "station_name") {
                continue;
            }
            prop = parseInt(prop);
            for (let m=0; m<accRow.length; m++){
                let row = accRow[m]
                let rowstaId = row.station_id
                accRow[m][prop] = "-";
                if (acc && acc.length > 0){
                    for (let j=0; j<acc.length; j++){
                        if ((prop == acc[j].sta_id) && (rowstaId == acc[j].station_id)){
                            accRow[m][prop] = acc[j].actual_money;
                        } 
                    }
                }
            }
        }

        if (act && act == "export") {
            let filename = 'accounts_list_' + (new Date().toLocaleDateString());
            let headers = [];
            let data = [];
            for (let i=0; i<header.length; i++) {
                headers.push(header[i].label)       
            } 

            let accList = []
            if (accRow && accRow.length > 0){
                for (let i=0; i<accRow.length; i++){
                    let rows = {}
                    for (let k in accRow[i]) {
                        let k1 = ""
                        for (let j=0; j<header.length; j++){
                            if (k == header[j].prop) {
                                k1 = header[j].label
                                rows[k1] = accRow[i][k]
                            } else {
                                continue;
                            }
                        }
                    }
                    accList.push(rows)
                }
                data = accList                
            }
            console.log(data)
            let buf = await modelUtils.toExcelBuf(headers, data)
            ctx.set('Content-disposition', 'attachment; filename=' + filename + '.xlsx');
            ctx.set('Content-type', 'application/xlsx');
            ctx.body = buf
        } else {
            ctx.body = {
                status : 0,
                msg : "success",
                data : {
                    header:header,
                    accounts_list :accRow
                }
            }
        }
    } catch(error){
        ctx.body = {
            status : 1,
            msg : "程序内部错误."
        }
    }
})

module.exports = router