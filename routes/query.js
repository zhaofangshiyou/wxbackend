/*
 * create by zone on 2018/04/23
 * 充值查询，消费查询,兆方公益,这里涵盖了大部分查询操作
 */
const router = require('koa-router')();
const config = require('../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const MysqlModel = require('../models/server.mysql.model')
const ChargeFlow = MysqlModel.get('ChargeFlow');
const OilFlow = MysqlModel.get('OilFlow');
const Card = MysqlModel.get('Card');
const Station = MysqlModel.get('Station');
const User = MysqlModel.get('User');
const secret = config.JWT_SECRET;
router.prefix(`/${config.VERSION}/query`)

router.use(function (ctx, next) {
    return next().catch((err) => {
        if (401 == err.status) {
            ctx.status = 401;
            ctx.json = {status: 401, message: "认证错误。"}
        } else {
            throw err;
        }
    });
});
// router.get('/getToken', async (ctx, next) => {
//     console.log("==> get");
//     let userToken = {name: "zone"};
//     const token = jwt.sign(userToken, secret, {expiresIn: '15s'})
//     console.log(ctx.params.userId)
//     ctx.body = token
// })
// router.use(koa_jwt({secret}))

router.get('/flow/charge/userId/:userId', async (ctx, next) => {//查,,0-全部 1-个人 2-单位
    try {
        // throw new Error("zone ==> ")
        console.log("==> get")
        let {page, limit, msg_type} = ctx.query
        page--;
        page < 0 ? page = 0 : page = page
        limit = parseInt(limit) || 10;
        console.log("page => " + page)
        console.log("limit => " + limit)
        console.log(ctx.params.userId)
        let options = {}
        options['user_id'] = parseInt(ctx.params.userId);
        if (msg_type && msg_type != 0) {
            options['type'] = msg_type;
        }

        let chargeFlow = await ChargeFlow.findAll({
            where: options
            , offset: page * limit
            , limit: limit
        });

        ctx.body = {
            status: 0
            , message: "success"
            , data: {
                flow: chargeFlow
            }
        }
    } catch (error) {
        console.log(error)
        ctx.body = {
            status: 1
            , message: "fail"
        }
    }

})


router.get('/flow/oil/userId/:userId', async (ctx, next) => {//查,,0-全部 1-个人 2-单位
    try {

        console.log("==> get")
        let {page, limit, msg_type} = ctx.query
        page--;
        page < 0 ? page = 0 : page = page
        limit = parseInt(limit) || 10;
        console.log(limit)
        console.log(ctx.params.userId)
        console.log(ctx.query)
        let options = {}
        options['user_id'] = parseInt(ctx.params.userId);
        if (msg_type != 0) {
            options['pay_channel'] = msg_type;
        }
        console.log(options);
        let oilFlow = await OilFlow.findAll({
            where: options
            // , include: [{
            //     model: Station
            // }]
            , offset: page * limit
            , limit: limit
        });

        ctx.body = {
            status: 0
            , msg: "success"
            , data: {
                flow: oilFlow
            }
        }
    } catch (error) {
        console.log(error)
        ctx.body = {
            status: 1
            , message: "error"
        }
    }
});

router.get('/flow/consume/userId/:userId', async (ctx, next) => {//查,,0-全部 1-个人 2-单位
    try {

        console.log("==> get")
        let {page, limit, msg_type, is_invoicing} = ctx.query
        page--;
        page < 0 ? page = 0 : page = page
        limit = parseInt(limit) || 10;
        console.log(limit)
        console.log(ctx.params.userId)
        console.log(ctx.query)
        let options = {}
        options['user_id'] = parseInt(ctx.params.userId);
        options['is_invoicing'] = is_invoicing;
        // if (msg_type != 0) {
        //     options['pay_channel'] = msg_type;
        // }
        console.log(options);
        let oilFlow = await OilFlow.findAll({
            where: options
            // , include: [{
            //     model:Station
            //     ,through:{
            //         attribute:['create_at','id','province']
            //     }
            // }]
            , offset: page * limit
            , limit: limit
        });

        ctx.body = {
            status: 0
            , msg: "success"
            , data: {
                flow: oilFlow
            }
        }
    } catch (error) {
        console.log(error)
        ctx.body = {
            status: 1
            , message: "error"
        }
    }
});


router.get('/welfareAmount/userId/:userId', async (ctx, next) => {//查
    try {


        console.log(ctx.params.userId)


        let user = await  User.findOne({
            where: {
                id: ctx.params.userId
            }
            , attributes: ['id', 'welfare_amount', 'total_vol']

        })


        ctx.body = {
            status: 0
            , msg: "success"
            , data: {
                user: user
            }
        }

    } catch (error) {
        console.log(error)
        ctx.body = {
            status: 1
            , msg: "fail"
        }
    }
})


module.exports = router
