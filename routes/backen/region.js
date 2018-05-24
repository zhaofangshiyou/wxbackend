/*
 * create by miah on 2018/04/08
 * 地域的增删改查
 */
const router = require('koa-router')();
const config = require('../../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const MysqlModel = require('../../models/server.mysql.model')
const Region = MysqlModel.get('Region');
const oilModel = require('../../models/oil_model');
const request = require('request-promise-native');
const xlsx = require('xlsx');
const common = require('../utils/common');

router.prefix(`/${config.VERSION}/backen/region`)

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

//获取省份, type = P
router.get('/provinces', async (ctx, next) => {
    try {

        let {src} = ctx.query
        let provinces = await Region.findAll({
            attributes: {
                exclude: ["created_at","updated_at","deleted_at"]
            },
            where: {
                type: "P"
            }
        })

        provinces = JSON.stringify(provinces)
        provinces = JSON.parse(provinces)

        let data = provinces
        //判断oil_price省份是否设置油价
        if (src == "oil_price_add") {
            data = []
            console.log(data)
            let oilPrice = await oilModel.queryAllOilPrice();
            for (let i=0; i<provinces.length; i++){
                let id = provinces[i].id;
                data[i] = {}
                data[i].id = provinces[i].id
                data[i].name = provinces[i].name
                data[i].type = provinces[i].type
                data[i].parent_id = provinces[i].parent_id
                data[i]["disable"] = false //未绑定
                for (let j=0; j<oilPrice.length; j++){
                    let proId = oilPrice[j].province_id;
                    if (id == proId) {
                        data[i]["disable"] = true
                    }
                }
            }
        }

        ctx.body = {
            status: 0,
            msg: "success",
            data: {
                provinces: data
            }
        }
    } catch (error) {
        ctx.body = {
            status: 1,
            msg: error ? error : "未找到省份信息."
        }
    }
})




module.exports = router