/* create by miah on 2018/05/28
* 优惠管理

修改于 2018/06/06
1.优惠文案只允许有一条，标题内容不限
2.一旦创建只用于更新、查看
*/
const router = require('koa-router')();
const config = require('../../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const oilModel = require('../../models/oil_model');
const stationModel = require('../../models/station_model');
const discountModel = require('../../models/discount_model');
const commonUtil = require('../utils/common');
const modelUtils = require('../../models/utils/common')
const ExcelMap = require('../../config/excel_map')

router.prefix(`/${config.VERSION}/backen/discount`)

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

//新增优惠信息
router.post('/add', async(ctx, next) => {
    try {
        let {province_id, station_ids, discount_type, begin_time, end_time,               
             oil_price, discount_days, amount_start} = ctx.request.body;
        console.log(JSON.stringify(ctx.request.body))
        if ((!discount_type) || (discount_type == "")) {
            ctx.body = {
                status : 3,
                msg : "传入参数必须指定优惠类型."
            }
            return ;
        }

        discount_type = parseInt(discount_type); 
        //优惠类型1：设定各个油品的油价优惠价,有效天数，优惠开始结束时间
        if (discount_type && (discount_type ==1)){

            let params = {province_id, station_ids, discount_type, begin_time,
                end_time, oil_price, discount_days, amount_start};

            if ((commonUtil.reqParamsIsNull(params) || 
                (!commonUtil.isJsonString(station_ids)) ||
                (!commonUtil.isJsonString(oil_price)) )) {
                    ctx.body = {
                        status : 2,
                        msg : "传入参数错误."
                    }
                return ;
            }

            let begin_time_stamp = new Date(begin_time).getTime();
            let end_time_stamp = new Date(end_time).getTime();
            if ((!begin_time_stamp) || (!end_time_stamp) || 
                (begin_time_stamp > end_time_stamp)) {
                    ctx.body = {
                        status : 5,
                        msg : "开始时间不能大于结束时间。"
                    }
            }

            station_ids = JSON.parse(station_ids);
            oil_price = JSON.parse(oil_price);
            let discountColumn = await discountModel.queryColumnFromDiscount();
            if ((!discountColumn) || (discountColumn.length ==0)){
                ctx.body = {
                    status : 4,
                    msg : "数据库存储字段已变更，联系开发人员修改."
                }
                return ;
            }

            let discountRow = [];
            for (let i=0; i<station_ids.length; i++) {
                let station_id = station_ids[i];
                let staInfo = await stationModel.queryStationById(station_id);
                if (!staInfo || (staInfo.length !=1)){
                    continue
                };

                let row = {};
                row["discount_type"] = discount_type;
                row["station_id"] = parseInt(station_id);
                row["amount_start"] = parseFloat(amount_start);
                row["discount_date_start"] = begin_time;
                row["discount_date_end"] = end_time;
                row["discount_days"] = parseInt(discount_days);
                for (let j=0; j<oil_price.length; j++) {
                    let oil_id = oil_price[j].oil_id;
                    let price = oil_price[j].price;
                    let oilInfo = await oilModel.queryOilById(parseInt(oil_id));
                    if (!oilInfo || oilInfo.length != 1 ){
                        continue;
                    }

                    let oil_name = oilInfo[0].name; //油品ID对应的名字
                    for (let m=0; m<discountColumn.length; m++) {
                        let oilColumn = discountColumn[m].COLUMN_NAME;
                        let oilM = oilColumn.split("_");
                        let oil_column_name = oilM[oilM.length-1];
                        //油品名字匹配
                        if (oil_name.replace(/[^0-9]/ig,"") == (oil_column_name)) {
                            row[oilColumn] = price;
                        } else {
                            continue;
                        }
                    }
                }
                discountRow.push(row);
            }
            
            let ret = await discountModel.addDiscountRule(discountRow);
            ctx.body = {
                status : 0,
                msg : "success"
            }
        } else {
            ctx.body = {
                status : 10,
                msg : "其他优惠类型定制中."
            }
            return ;
        }

    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误."
        }
    }
})

//修改优惠信息
router.put('/upd/:id', async(ctx, next) =>{
    try {
        let { station_id, discount_type, begin_time, end_time, oil_price, 
              discount_days, amount_start} = ctx.request.body;
        let id = ctx.params.id

        if ((!id) || (id == "")) {
            ctx.body = {
                status : 3,
                msg : "传入参数必须有列表ID和优惠类型 。"
            }
            return ;
        }
        
        id = parseInt(id);
        let discountRuleInfo = await discountModel.queryDiscountRuleById(id);
        if (!discountRuleInfo || (discountRuleInfo.length !=1)){
            ctx.body = {
                status : 5,
                msg : "传入的id没有对应的记录."
            }
            return ;
        }

        //优惠类型1：设定各个油品的油价优惠价,有效天数，优惠开始结束时间
        if (discount_type && (parseInt(discount_type) ==1)){
            discount_type = parseInt(discount_type); 
            let params = {station_id, discount_type, begin_time,
                end_time, oil_price, discount_days, amount_start};

            if ((commonUtil.reqParamsIsNull(params) || 
                (!commonUtil.isJsonString(oil_price)) )) {
                    ctx.body = {
                        status : 2,
                        msg : "传入参数错误."
                    }
                return ;
            }

            let begin_time_stamp = new Date(begin_time).getTime();
            let end_time_stamp = new Date(end_time).getTime();
            if ((!begin_time_stamp) || (!end_time_stamp) || 
                (begin_time_stamp > end_time_stamp)) {
                    ctx.body = {
                        status : 7,
                        msg : "开始时间不能大于结束时间。"
                    }
                    return ;
            }

            if (parseInt(station_id)!=discountRuleInfo[0].station_id){
                ctx.body = {
                    status : 6,
                    msg : "传入的油站ID与原来的不符."
                }
                return ;
            }

            oil_price = JSON.parse(oil_price);
            let discountColumn = await discountModel.queryColumnFromDiscount();
            if ((!discountColumn) || (discountColumn.length ==0)){
                ctx.body = {
                    status : 4,
                    msg : "数据库存储字段已变更，联系开发人员修改."
                }
                return ;
            }
         
            let row = {};
            row["discount_type"] = discount_type;
            row["station_id"] = parseInt(station_id);
            row["amount_start"] = parseInt(amount_start);
            row["discount_date_start"] = begin_time;
            row["discount_date_end"] = end_time;
            row["discount_days"] = parseInt(discount_days);
            for (let j=0; j<oil_price.length; j++) {
                let oil_id = oil_price[j].oil_id;
                let price = oil_price[j].price;
                let oilInfo = await oilModel.queryOilById(parseInt(oil_id));
                if (!oilInfo || oilInfo.length != 1 ){
                    continue;
                }

                let oil_name = oilInfo[0].name; //油品ID对应的名字
                for (let m=0; m<discountColumn.length; m++) {
                    let oilColumn = discountColumn[m].COLUMN_NAME;
                    let oilM = oilColumn.split("_");
                    let oil_column_name = oilM[oilM.length-1];
                    //油品名字匹配
                    if (oil_name.replace(/[^0-9]/ig,"") == (oil_column_name)) {
                        row[oilColumn] = price;
                    } else {
                        continue;
                    }
                }
            }
        
            let ret = await discountModel.updDiscountRuleById(id,row);
            ctx.body = {
                status : 0,
                msg : "success",
                data : ret
            }
        } else {
            ctx.body = {
                status : 10,
                msg : "其他优惠类型定制中."
            }
            return ;
        }

    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误."
        }
    }
})

//删除
router.delete('/del', async(ctx, next)=> {
    try {
        let {ids} = ctx.request.body
        if ((!ids) || (!commonUtil.isJsonString(ids))){
            ctx.body = {
                status : 2,
                msg : "传入参数错误"
            }
            return ;
        }

        ids = JSON.parse(ids);
        let ret = await discountModel.delDiscountRule(ids);
         ctx.body = {
             status : 0,
             msg : "success",
             data : ret
         }
        
    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误"
        }
    }
})

//初始化页面，分页
router.get('/', async(ctx, next)=> {
    try {
        let {act, province_id, station_id, begin_time, end_time, page_num ,num} = ctx.query;

        num = (num && (parseInt(num)>=0)) ? parseInt(num) : 15;  //默认15条
        page_num = (page_num && (parseInt(page_num)>=1)) ? (parseInt(page_num)-1) : 0;  //默认从第一条开始

        let options = {};
        options["province_id"] = province_id
        options["station_id"] = station_id
        options["begin_time"] = begin_time
        options["end_time"] = end_time
        options["page_num"] = page_num
        options["num"] = num

        let discountRuleList = await discountModel.queryDiscountRuleList(options);
        options.num = 0;
        let discountCnt = await discountModel.queryDiscountRuleList(options)

        if (act && act == "export") {
            let filename = 'discount_rule_list_' + (new Date().toLocaleDateString());
            let headers = [];
            let data = [];
            let mvParam = ["province_id","id","discount_type","created_at","updated_at",
                "discount_date_start", "discount_date_end", "deleted_at","station_id"]
            if (discountCnt && discountCnt.length >0) {
                for (let k in discountCnt[0]) {
                    if (commonUtil.strInArray(k,mvParam)){
                        continue;
                    } else {
                        headers.push(k)    
                    }
                } 
                data = discountCnt 

                let languageCH = ExcelMap.languageCH();
                if (languageCH) {
                    let discountRuleMap = ExcelMap.discountRule()
                    headers = commonUtil.getExcelHeader(headers,discountRuleMap)
                    data = commonUtil.getExcelData(discountRuleMap,data) 
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
                    discount_rule_list : discountRuleList,
                    discount_rule_cnt : discountCnt.length
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

//优惠文案
router.post('/doc/add', async(ctx, next) => {
    try {
        let {title,content} = ctx.request.body
        let params = {title, content}
        if (commonUtil.reqParamsIsNull(params)){
            ctx.body = {
                status : 2,
                msg : "传入参数错误。"
            }
            return ;
        }

        //let discountDoc = await discountModel.queryDiscountDocByTitle(title)
        let discountDoc = await discountModel.queryDiscountDoc();
        if (discountDoc && discountDoc.length !=0) {
            ctx.body = {
                status : 3,
                //msg : "已经存在此标题的文案，请更换标题或检查是否重复。"
                msg : "已经存在优惠文案."
            }
            return ;
        }

        let options = {};
        options.title = title;
        options.content = content;
        let ret = await discountModel.addDiscountDoc(options)
        ctx.body = {
            status : 0,
            msg : "success"
        }
    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "内部程序错误."
        }
    }
})

router.put('/doc/upd/:id', async(ctx, next)=>{
    try {
        let id = ctx.params.id 
        let {title,content} = ctx.request.body
        let params = {id, title, content}
        if (commonUtil.reqParamsIsNull(params)){
            ctx.body = {
                status : 2,
                msg : "传入参数错误。"
            }
            return ;
        }

        id = parseInt(id);
        let discountDoc = await discountModel.queryDiscountDocById(id);
        if (!discountDoc || discountDoc.length != 1) {
            ctx.body = {
                status : 3,
                msg : "传入ID不存在."
            }
        }

        let options ={};
        options.title = title
        options.content = content

        let ret = await discountModel.updateDiscountDoc(id,options)
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

router.get('/doc', async(ctx, next)=>{
    try {
        let {id, title,begin_time, end_time, page_num, num} = ctx.query;

        num = (num && (parseInt(num)>=0)) ? parseInt(num) : 15;  //默认15条
        page_num = (page_num && (parseInt(page_num)>=1)) ? (parseInt(page_num)-1) : 0;  //默认从第一条开始

        let options ={}
        options.id = id;
        options.title = title;
        options.begin_time = begin_time;
        options.end_time = end_time;
    
        //let discountDoc = await discountModel.queryDiscountDoc(options,page_num,num)
        let discountDoc = await discountModel.queryDiscountDoc(options,0,1)
        let docCnt = await discountModel.queryDiscountDoc(options,page_num,0)

        ctx.body = {
            status : 0,
            msg : "success",
            data : {
                discount_doc_list : discountDoc,
                discount_doc_cnt : docCnt.length
            }
        }
    } catch(error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误."
        }
    }
})

//删除
router.delete('/doc/del', async(ctx, next)=> {
    try {

        let {ids} = ctx.request.body

        if ((!ids) || (!commonUtil.isJsonString(ids))){
            ctx.body = {
                status : 2,
                msg : "传入参数错误"
            }
            return ;
        }
  
        ids = JSON.parse(ids);
       
        let ret = await discountModel.delDiscountRuleDoc(ids);
         ctx.body = {
             status : 0,
             msg : "success",
             data : ret
         }
        
    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误"
        }
    }
})

module.exports = router
