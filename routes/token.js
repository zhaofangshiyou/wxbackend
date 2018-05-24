/*
 * create by zone on 2018/04/08
 * 用于获取 token
 */
const router = require('koa-router')()
const config = require('../config/config')

const jwt = require('jsonwebtoken');

router.prefix(`/${config.VERSION}/token`)


router.get('/', async (ctx, next) => {//获取 token
    console.log("==> get");
    let userToken = {name: "zone"};
    let token = jwt.sign(userToken, config.JWT_SECRET, {expiresIn: config.JWT_EXPIRES_IN})
    console.log(ctx.params.userId)
    ctx.body = {
        status: 0
        , msg: 'success'
        , data: {
            token: token
        }
    }
})
module.exports = router
