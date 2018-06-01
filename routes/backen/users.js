/* create by miah on 2018/04/08
* 用户管理
*/
const router = require('koa-router')();
const config = require('../../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const oilModel = require('../../models/oil_model');
const stationModel = require('../../models/station_model');
const financeModel = require('../../models/discount_model');
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
//router.post('/add')

module.exports = router
