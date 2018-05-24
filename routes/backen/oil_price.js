/*
 * create by miah on 2018/04/08
 * 油价的增删改查
 */
const router = require('koa-router')();
const config = require('../../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const oilModel = require('../../models/oil_model');
const stationModel = require('../../models/station_model');
const regionModel = require('../../models/region_model');
const commonUtil = require('../utils/common');

router.prefix(`/${config.VERSION}/backen/oil`)

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

//新增油品油价关系
router.post('/price/add', async (ctx, next) => {
    try {
        let {province_ids,oil_price,active_at} = ctx.request.body;
        let params = {province_ids,oil_price,active_at};
        //调价时间必须大于现在是0点
        let now = new Date().getTime()

        if (commonUtil.reqParamsIsNull(params) ||
           (!commonUtil.isJsonString(province_ids)) ||
           (!commonUtil.isJsonString(oil_price)) ||
           (now > parseInt(active_at))) {
            ctx.body = {
                status : 2,
                msg : "传入参数错误."
            }
            return ;
        }

        province_ids = JSON.parse(province_ids);
        oil_price = JSON.parse(oil_price);

        let insertTb = [];

        for (let i=0; i<province_ids.length; i++) {
            let province_id = province_ids[i];
            let proInfo = await regionModel.queryProvinceById(province_id)
            if ((!proInfo) || proInfo.length != 1 ) {
                continue;
            }

            for (let j=0; j<oil_price.length; j++){
                let oil_id = parseInt(oil_price[j].oil_id);
                let price = oil_price[j].price;
                //格式错误
                let oilParams = {oil_id,price};
                if (commonUtil.reqParamsIsNull(oilParams)) {
                    continue;
                }
                //油不存在
                let oilInfo = await oilModel.queryOilById(oil_id);
                if ((!oilInfo) || (oilInfo.length!=1)) {
                    continue;
                }

                //该省已经有价格
                let oilPriceInfo = await oilModel.queryOilPriceByProOil(province_id,oil_id)
                if (oilPriceInfo && oilPriceInfo.length > 0) {
                    continue;
                }

                let insertRow = {};
                insertRow.oil_id = oil_id;
                insertRow.name = oilInfo[0].name;
                insertRow.price = price;
                insertRow.province_id = province_id;
                insertRow.active_at = active_at;
                insertTb.push(insertRow);
            }
        }

        let ret = await oilModel.addOilPrice(insertTb)
        if (!ret) {
            ctx.body = {
                status : 3,
                msg : "新增记录失败."
            }
        }

        ctx.body = {
            status : 0,
            msg : "success",
            data : ret
        }
    } catch (error) {
        ctx.body = {
            status : 1 ,
            msg : "程序内部错误."
        }
    }
})

//修改油品油价关系,按省修改,先删除，在新增
router.put('/price/upd/province/:province_id', async (ctx, next) => {
    try {
        let province_id = ctx.params.province_id
        let {oil_price,active_at} = ctx.request.body;
        let params = {province_id,oil_price,active_at};

        //调价时间必须大于现在是0点
        let now = new Date().getTime()

        if ((commonUtil.reqParamsIsNull(params)) ||
            (!commonUtil.isJsonString(oil_price)) ||
            (now > parseInt(active_at))) {
            ctx.body = {
                status : 2,
                msg : "传入参数错误."
            }
            return ;
        }

        province_id = parseInt(province_id);
        oil_price = JSON.parse(oil_price);

        let OilPrice = await oilModel.queryOilPriceByProId(province_id);
        if ((!OilPrice) || (OilPrice.length == 0)) {
            ctx.body = {
                status : 3,
                msg : "传入的省份ID没有对应油价记录."
            }
            return ;
        }

        if (province_id != OilPrice[0].province_id) {
            ctx.body = {
                status : 4,
                msg : "传入的省份信息不一致."
            }
            return ;
        }

        let insertTb = [];

        let proInfo = await regionModel.queryProvinceById(province_id)
        if ((!proInfo) || proInfo.length != 1 ) {
            ctx.body = {
                status : 5,
                msg : "省份ID对应的省份不存在"
            }
            return ;
        }

        let province_ids = []
        province_ids.push(province_id)
        let del = oilModel.delOilPriceByProvince(province_ids);

        for (let j=0; j<oil_price.length; j++){
            let oil_id = parseInt(oil_price[j].oil_id);
            let price = oil_price[j].price;

            //格式错误
            let oilParams = {oil_id,price};
            if (commonUtil.reqParamsIsNull(oilParams)) {
                continue;
            }

            //油不存在
            let oilInfo = await oilModel.queryOilById(oil_id);
            if ((!oilInfo) || (oilInfo.length!=1)) {
                continue;
            }

            //该省已经有价格
            let oilPriceInfo = await oilModel.queryOilPriceByProOil(province_id,oil_id,active_at)
            if (oilPriceInfo  && oilPriceInfo.length > 0) {
                let del = oilModel.delOilPriceByProvince(province_ids);
            }

            let insertRow = {};
            insertRow.oil_id = oil_id;
            insertRow.name = oilInfo[0].name;
            insertRow.price = price;
            insertRow.province_id = province_id;
            insertRow.active_at = active_at;
            insertTb.push(insertRow);
        }

        let ret = await oilModel.addOilPrice(insertTb)
        if (!ret) {
            ctx.body = {
                status : 6,
                msg : "修改记录失败."
            }
        }

        ctx.body = {
            status : 0,
            msg : "success",
            data : ret
        }
    } catch (error) {
        ctx.body = {
            status : 1 ,
            msg : "程序内部错误."
        }
    }
})

//删除油品油价关系
router.delete('/price/del', async (ctx, next) => {
    try {
        let {province_ids} = ctx.request.body
        if ((!province_ids) || (!commonUtil.isJsonString(province_ids))) {
            ctx.body = {
                status : 2,
                msg : "传入参数错误."
            }
            return ;
        }

        province_ids = JSON.parse(province_ids)
        let del = await oilModel.delOilPriceByProvince(province_ids);

        ctx.body = {
            status : 0,
            msg : "success",
            data : del
        }
    } catch (error) {
        ctx.body = {
            status : 1 ,
            msg : "程序内部错误."
        }
    }
})

//初始化油品油价关系
router.get('/price', async (ctx, next) => {
    try {
        let {page_num, num, province_id} = ctx.query

        num = (num && (parseInt(num)>=0)) ? parseInt(num) : 15;  //默认15条
        page_num = (page_num || (parseInt(page_num)>=0)) ? (parseInt(page_num)-1) : 0;  //默认从第一条开始

        let options = {}
        if (province_id) {
            province_id = parseInt(province_id);
            options['province_id'] = province_id;
        }

        let priceList = await oilModel.queryOilPriceList(options,page_num,num);

        let priceListCnt = await oilModel.queryOilPriceList(options,0,0);

        //element-ui动态表格适应格式
        let oilInfo = await oilModel.queryAllOilInfo();
        let header = [{"prop":"province","lable":"省份"}];
        for (let i=0; i<oilInfo.length; i++){
            let oil_id = oilInfo[i].id;
            let oil_name = oilInfo[i].name;
            let oilKV = {}
            oilKV.prop = oil_id.toString();
            oilKV.lable = oil_name;
            //oilKV[oil_id] = oil_name;
            header.push(oilKV)
        }
        header.push({"prop":"active_at","lable":"生效时间"});
        //console.log(JSON.stringify(header))

        let oil_price_list = []
        for (let i=0; i<priceList.length; i++) {
            let oils = priceList[i].oils;
            let province_name = priceList[i].name
            let proId = priceList[i].id
            let row = {}
            row["province"] = province_name
            row["province_id"] = proId
            for (let j=0; j<oils.length; j++){
                let oil_id = oils[j].oil_id
                let oil_price = oils[j].price
                let time = new Date(parseInt(oils[j].active_at));
                times = time.toLocaleString();

                for (let n=0; n<header.length; n++){
                    let field = header[n].prop
                    if ((parseInt(field) == oil_id)) {
                        row[field] = oil_price ? oil_price : 0;

                    }
                }
                row["active_at"] = times;
            }
            oil_price_list.push(row)
        }

        //未适应element-ui的格式
        for (let i=0; i<priceList.length; i++) {
            let oils = priceList[i].oils;
            for (let j=0; j<oils.length; j++){
                let time = new Date(parseInt(oils[j].active_at));
                times = time.toLocaleString();
                oils[j].active_at = times;
            }
        }

        ctx.body = {
            status : 0,
            msg : "success",
            data : {
                //price_list : priceList,
                header : header,
                oil_price_list: oil_price_list,
                list_cnt : priceListCnt.length
            }
        }

    } catch (error) {
        ctx.body = {
            status : 1 ,
            msg : "程序内部错误."
        }
    }
})

module.exports = router