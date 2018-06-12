/* create by miah on 2018/05/28
* 登陆管理
*/
const router = require('koa-router')();
const config = require('../../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const oilModel = require('../../models/oil_model');
const stationModel = require('../../models/station_model');
const authModel = require('../../models/auth_model');
const commonUtil = require('../utils/common');
const modelUtils = require('../../models/utils/common')
const ExcelMap = require('../../config/excel_map')
const crypto = require('crypto')

router.prefix(`/${config.VERSION}/backen/auth`)

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

router.post('/login', async (ctx, next) => {
    try {
        let {login, password} = ctx.request.body 
        let params = {login, password}
        
        if (commonUtil.reqParamsIsNull(params)) {
            ctx.body = {
                status : 2,
                msg : "传入参数错误."
            }
            return ;
        }

        login = login.trim();
        password = password.trim();

        let ret = await authModel.loginAuth(login,password);
        if (!ret || (ret.length != 1)){
            ctx.body = {
                status : 3,
                msg : "用户名或密码错误."
            }
            return ;
        }

        ctx.body = {
            status : 0,
            msg : "success",
            data : ret[0]
        }

    }catch(error){
        ctx.body = {
            status : 1,
            msg : "内部程序错误."
        }
    }
})


module.exports = router