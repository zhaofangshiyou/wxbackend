/* create by miah on 2018/04/08
* 优惠管理
*/
const router = require('koa-router')();
const config = require('../../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const oilModel = require('../../models/oil_model');
const stationModel = require('../../models/station_model');
const discountModel = require('../../models/discount_model');
const commonUtil = require('../utils/common');

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
        let params = {province_id, station_ids, discount_type, begin_time,
                        end_time, oil_price, discount_days, amount_start};
        
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
            if ((commonUtil.reqParamsIsNull(params) || 
                (!commonUtil.isJsonString(station_ids)) ||
                (!commonUtil.isJsonString(oil_price)) )) {
                    ctx.body = {
                        status : 2,
                        msg : "传入参数错误"+commonUtil.isJsonString(oil_price)
                    }
                return ;
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
                    console.log("++++++++++++++++++++++++++++");
                    let oilInfo = await queryOilById(parseInt(oil_id));
                    if (!oilInfo || oilInfo.length != 1 ){
                        continue;
                    }

                    let oil_name = oilInfo[0].name; //油品ID对应的名字
                    for (let m=0; m<discountColumn.length; m++) {
                        let oilColumn = discountColumn[m].column_name;
                        let m = oilColumn.split("_");
                        let oil_column_name = m[m.length-1];
                        console.log("oil_column_name....."+oil_column_name+"=="+oil_name);
                        //油品名字匹配
                        if (oil_name.indexOf(oil_column_name) != -1) {
                            row[oil_column_name] = price;
                        } else {
                            continue;
                        }
                    }
                }
                discountRow.push(row);
            }
            console.log(discountRow);
            let ret = await discountModel.addDiscountRule(discountRow);
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
        }

    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误."
        }
    }
})

module.exports = router
