/* create by miah on 2018/04/08
* 用户管理
*/
const router = require('koa-router')();
const config = require('../../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const oilModel = require('../../models/oil_model');
const stationModel = require('../../models/station_model');
const backendUserModel = require('../../models/user_model');
const commonUtil = require('../utils/common');
const modelUtils = require('../../models/utils/common');
const ExcelMap = require('../../config/excel_map')

router.prefix(`/${config.VERSION}/backen/users`)

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

//用户消费明细
router.get('/consume/detail', async (ctx, next) => {
    try {
        let {act, card_no, page_num, num} = ctx.query;

        num = (num && (parseInt(num)>=0)) ? parseInt(num) : 15;  //默认15条
        page_num = (page_num && (parseInt(page_num)>=1)) ? (parseInt(page_num)-1) : 0;  //默认从第一条开始
        
        let card_id = 0;
        if (card_no && card_no != "") {
            card_id = parseInt(card_no.slice(4));
        }

        let consumeList = await backendUserModel.queryUserConsume(card_id,page_num,num);
        let consumeCnt = await backendUserModel.queryUserConsume(card_id,page_num,0)

        if (act && act == "export") {
            let filename = 'user_consume_detail_list_' + (new Date().toLocaleDateString());
            let headers = [];
            let data = [];
            let mvParam = ["pay_type"]
            if (consumeCnt && consumeCnt.length >0) {
                for (let k in consumeCnt[0]) {
                    if (commonUtil.strInArray(k,mvParam)){
                        continue;
                    } else {
                        headers.push(k)    
                    }
                } 
                data = consumeCnt 

                let languageCH = ExcelMap.languageCH();
                if (languageCH) {
                    let userConsumeDetailMap = ExcelMap.userConsumeDetail()
                    headers = commonUtil.getExcelHeader(headers,userConsumeDetailMap)
                    data = commonUtil.getExcelData(userConsumeDetailMap,data) 
                }
            }
    
            let buf = await modelUtils.toExcelBuf(headers, data)
            ctx.set('Content-disposition', 'attachment; filename=' + filename + '.xlsx');
            ctx.set('Content-type', 'application/xlsx');
            ctx.body = buf
        } else {
            ctx.body = {
                status : 0,
                msg : "success",
                data : {
                    consume_list : consumeList,
                    consume_list_cnt : consumeCnt.length
                }
            }
        }
    }catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误."
        }
    }
})

//初始化列表
router.get('/', async (ctx, next) => {
    try {
        let {act, card_no, page_num, num} = ctx.query

        num = (num && (parseInt(num)>=0)) ? parseInt(num) : 15;  //默认15条
        page_num = (page_num && (parseInt(page_num)>=1)) ? (parseInt(page_num)-1) : 0;  //默认从第一条开始
        
        let cardList = await backendUserModel.queryUserCardList(card_no,page_num,num);
        let cardCnt = await backendUserModel.queryUserCardList(card_no,page_num,0);
        
        for (let i=0; i<cardList.length; i++){
            cardList[i]["initiate_refund_disable"] = false  //发起退款
            cardList[i]["confirm_refund_disable"] = false //确认退款
            cardList[i]["cancel_disable"] = false  //销户
            let parent_id = cardList[i].parent_id
            let status = cardList[i].status
            let refund_status = cardList[i].refund_status
            //副卡不允许申请
            if (parent_id && parent_id != "") {
                cardList[i]["initiate_refund_disable"] = true
                cardList[i]["confirm_refund_disable"] = true
            }
            //退款申请中
            if (refund_status && parseInt(refund_status) ==1) {
                cardList[i]["initiate_refund_disable"] = true
            }
            //非退款申请状态
            if (refund_status && parseInt(refund_status) !=1) {
                cardList[i]["confirm_refund_disable"] = true
            }
            //销户后
            if (status && parseInt(status) == 1) {
                cardList[i]["cancel_disable"] = true
                cardList[i]["initiate_refund_disable"] = true
                cardList[i]["confirm_refund_disable"] = true
            } else {
                continue;
            }
        }

        if (act && act == "export") {
            let filename = 'user_card_list_' + (new Date().toLocaleDateString());
            let headers = [];
            let data = [];
            let mvParam = ["id","unit_card_type","refund_status","status","initiate_by","confirm_by"]
            if (cardCnt && cardCnt.length >0) {
                for (let k in cardCnt[0]) {
                    if (commonUtil.strInArray(k,mvParam)){
                        continue; 
                    }else {
                        headers.push(k)    
                    }
                } 
                data = cardCnt 

                let languageCH = ExcelMap.languageCH();
                if (languageCH) {
                    let userCardMap = ExcelMap.userCard()
                    headers = commonUtil.getExcelHeader(headers,userCardMap)
                    data = commonUtil.getExcelData(userCardMap,data) 
                }
            }
    
            let buf = await modelUtils.toExcelBuf(headers, data)
            ctx.set('Content-disposition', 'attachment; filename=' + filename + '.xlsx');
            ctx.set('Content-type', 'application/xlsx');
            ctx.body = buf
        } else {
            ctx.body = {
                status : 0,
                msg : "success",
                data : {
                    card_list : cardList,
                    card_list_cnt : cardCnt.length
                }
            }
        }
    } catch(error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误."
        }
    }
})

//注销卡号
router.delete('/card/del', async (ctx, next) => {
    try{
        let {ids} = ctx.request.body

        if ((!ids) || (!commonUtil.isJsonString(ids))) {
            ctx.body = {
                status : 2,
                msg : "传入参数错误."
            }
            return ;
        }

        ids = JSON.parse(ids);
        let delId = []
        for (let i=0; i<ids.length; i++){
            let id = ids[i]
            let cardInfo = await backendUserModel.queryCardById(id);
            if (!cardInfo || cardInfo.length !=1){
                continue;
            }

            let isMainCard = await backendUserModel.querySubCardById(id);
           
            //主卡，则把底下副卡一起注销
            if (isMainCard && isMainCard.length >0) {
                delId.push(parseInt(id))
                for (let j=0; j<isMainCard.length; j++) {
                    delId.push(parseInt(isMainCard[j].id))
                }
            } else {
                //非主卡直接注销
                delId.push(parseInt(id))
            }
        }

        let now = new Date()
        now = now.toLocaleString()

        if (delId && delId.length >0) {
            let ret = await backendUserModel.delCards(delId,now);
        }

        ctx.body = {
            status : 0,
            msg : "success"
        }
    }catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误."
        }
    }
})

//申请退款
router.post('/refund/apply/', async (ctx, next) => {
    try {
        let {id,initiate_by} = ctx.request.body
        if (!id || id == "" || !initiate_by || initiate_by =="") {
            ctx.body = {
                status : 2,
                msg :"传入参数错误"
            }
            return ;
        }

        id = parseInt(id);
        initiate_by = parseInt(initiate_by);
        let userInfo = await backendUserModel.queryUserById(initiate_by)
        if (!userInfo || userInfo.length !=1) {
            ctx.body = {
                status : 5,
                msg : "发起人用户ID不存在."
            }
            return ;
        }

        let cardInfo = await backendUserModel.queryCardById(id);
        if (!cardInfo || cardInfo.length !=1){
            ctx.body = {
                status : 3,
                msg : "传入参数卡号ID不存在."
            }
            return ;
        }

        let ids = [];
        let options = [];
        let cardType = cardInfo[0].unit_card_type
        let parentId = cardInfo[0].parent_id
        if (parentId && (parentId != "") && (parseInt(cardType) ==0)) {
            ctx.body = {
                status : 4,
                msg : "副卡不允许直接退款，必须通过主卡操作."
            }
            return ;
        }

        if (parseInt(cardInfo[0].refund_status) == 1) {
            ctx.body = {
                status : 7,
                msg : "该卡号已经申请过退款，请等待确认."
            }
            return ;
        }

        let isMainCard = await backendUserModel.querySubCardById(id);
        //单位卡退款
        if (parseInt(cardType) == 1){
            let reginRow = {}
            reginRow.card_id = id
            reginRow.money = (cardInfo[0].company_balance+cardInfo[0].person_balance)
            reginRow.initiate_by = initiate_by
            reginRow.status = 1
            options.push(reginRow)
            //有副卡
            if (isMainCard && isMainCard.length >0) {
                for (let j=0; j<isMainCard.length; j++) {
                    ids.push(id)
                    ids.push(parseInt(isMainCard[j].id))
                    let row = {}
                    row.card_id = isMainCard[j].id
                    row.money = (isMainCard[j].company_balance+isMainCard[j].person_balance)
                    row.initiate_by = initiate_by
                    row.status = 1
                    options.push(row)
                }
            } else {
                ids.push(id)
            }
            console.log(options)
            console.log(ids)  
        //个人卡且不是副卡退款
        } else if(parseInt(cardType) == 0) {
            let reginRow = {}
            reginRow.card_id = id
            reginRow.money = (cardInfo[0].company_balance+cardInfo[0].person_balance)
            reginRow.initiate_by = initiate_by
            reginRow.status = 1
            options.push(reginRow)
            ids.push(id)
        } else {
            ctx.body = {
                status : 6,
                msg : "未定义的卡类型，无法操作"
            }
            return ;
        }

        let ret = await backendUserModel.refundApply(ids,options);
        ctx.body = {
            status : 0,
            msg : "success"
        }
    } catch(error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误."
        }
    }
})

//确认退款
router.post('/refund/confirm', async (ctx,next) => {
    try {
        let {id, confirm_by} = ctx.request.body
        if (!id || id == "" || !confirm_by || confirm_by =="") {
            ctx.body = {
                status : 2,
                msg :"传入参数错误"
            }
            return ;
        }

        id = parseInt(id);
        confirm_by = parseInt(confirm_by);

        let userInfo = await backendUserModel.queryUserById(confirm_by)
        if (!userInfo || userInfo.length !=1) {
            ctx.body = {
                status : 5,
                msg : "发起人用户ID不存在."
            }
            return ;
        }

        let cardInfo = await backendUserModel.queryCardById(id);
        if (!cardInfo || cardInfo.length !=1){
            ctx.body = {
                status : 3,
                msg : "传入参数卡号ID不存在."
            }
            return ;
        }

        if (cardInfo[0].refund_status !=1) {
            ctx.body = {
                status : 7,
                msg : "该卡号未申请退款，请先申请."
            }
            return ;
        }

        let ids = [];
        let cardType = cardInfo[0].unit_card_type
        let parentId = cardInfo[0].parent_id
        if (parentId && (parentId != "") && (parseInt(cardType) ==0)) {
            ctx.body = {
                status : 4,
                msg : "副卡不允许直接退款，必须通过主卡操作."
            }
            return ;
        }

        let isMainCard = await backendUserModel.querySubCardById(id);
        //单位卡退款
        if (parseInt(cardType) ==1){
            //有副卡
            if (isMainCard && isMainCard.length >0) {
                for (let j=0; j<isMainCard.length; j++) {
                    ids.push(id)
                    ids.push(parseInt(isMainCard[j].id))
                }
            } else {
                ids.push(id)
            }
        //个人卡且不是副卡退款
        } else if(parseInt(cardType) == 0) {
            ids.push(id)
        } else {
            ctx.body = {
                status : 6,
                msg : "未定义的卡类型，无法操作"
            }
            return ;
        }

        let ret = await backendUserModel.refundConfirm(ids,confirm_by);
        ctx.body = {
            status : 0,
            msg : "success"
        }
    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误"
        }
    }
})

module.exports = router
