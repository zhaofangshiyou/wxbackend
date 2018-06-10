/*
 * create by zone on 2018/04/01
 * 开卡
 */
const router = require('koa-router')();
const config = require('../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const crypto = require('crypto')
const redisUtil = require('./utils/redis_util')
const smsClient = require('./utils/sms')

const MysqlModel = require('../models/server.mysql.model')
const Card = MysqlModel.get('Card');
const User = MysqlModel.get('User');
const Station = MysqlModel.get('Station');
router.prefix(`/${config.VERSION}/card`)

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

// router.use(koa_jwt({secret}))
router.put('/password/userId/:userId', async (ctx, next) => {//0 - 验证码正确，且密码修改成功，1 - 程序错误 2 - 验证码错误，修改失败
    try {
        let {code, mobile, password} = ctx.request.body
        let result = await smsClient.verifyCode(code, mobile)

        if (!result) {
            ctx.body = {
                status: 2
                , msg: "verify code error"
            }
            return
        }
        let md5 = crypto.createHash('md5')
        password = md5.update(password).digest('hex');
        console.log(" 加密之后的 password => "+password)
        await Card.update({
            password: password
        }, {
            where: {
                user_id: ctx.params.userId
            }
        })


        ctx.body = {
            status: 0
            , msg: "success"
        }
    } catch (error) {
        console.log(error)
        console.log(" 修改失败 ！")
        ctx.body = {
            status: 1
            , msg: "error"
        }
    }
})


router.get('/userId/:userId', async (ctx, next) => {
    try {

        let card = await Card.findOne({
            attributes: {exclude: ['password']}
            , where: {
                user_id: parseInt(ctx.params.userId)
            }
            //2018-5-16
            /*, include: [{
            //    model: User
            }]*/
        })
        console.log("==  card ======> get")
        console.log(card)
        ctx.body = {
            status: 0
            , msg: "success"
            , data: {
                card: card
            }
        }
    } catch (error) {
        console.log(error)
        ctx.body = {
            status: 1
            , msg: "error"
        }
    }
})

router.post('/', async (ctx, next) => {//开卡

    let {user_id, password, unit_card_type, mobile, code, latitude, longitude, station_id} = ctx.request.body
    console.log("====== 参数 ==>")
    console.log(ctx.request.body)
    if (!mobile) {
        ctx.body = {
            status: 2
            , msg: 'mobile invalid'
        }
        return
    }
    let result = await redisUtil.get(mobile)
    console.log('code => ' + code + ' result => ' + parseInt(result));
    if (code != parseInt(result)) {
        ctx.body = {
            status: 3
            , msg: 'wrong code'
        }
        return
    }
    // let card_num;
    // let card_prefix = 1001;
    // let card_prefixs = [1001, 1002, 1003, 1004];
    // let index = Math.floor(Math.random() * 10);

    let station = await Station.findOne({
        where: {
            id: station_id
        }
        , attributes: ['card_prefix']
    })
    let user = await User.findOne({
        where: {
            id: user_id
        }
    })
    let md5 = crypto.createHash('md5')
    password = md5.update(password).digest('hex');
    console.log("==> post")
    let newCard = await Card.create({
        user_id: user.id     //用户ID
        // , card_num: DataTypes.STRING      //卡号*
        , card_prefix: station.card_prefix      //油站编号

        , person_balance: 0       //个人余额
        , company_balance: 0   //单位余额
        , score: 0  //积分
        , unit_card_type: unit_card_type  //卡类型
        // , parent_id: DataTypes.STRING      //主卡ID
        , station_id: station_id      //办卡油站
        , welfare_amount: 0      //公益金
        , password: password      //密码
        , total_vol: 0  //累计加油*
    })
    await User.update({
        mobile: mobile
    }, {
        where: {
            id: user_id
        }
    })



    ctx.body = {
        status: 0
        , msg: "success"
    }
})
router.put('/:cardId', async (ctx, next) => {
    console.log("==> put")
    console.log(ctx.params.userId)
    ctx.body = ctx.params
})
router.delete('/:cardId', async (ctx, next) => {
    console.log("==> delete")
    console.log(ctx.params.userId)
    ctx.body = ctx.params
})
// router.get('/findUser', async (ctx, next) => {
//     console.log("==> delete")
//     console.log(ctx.params.userId)
//     let user = await User.findOne({
//         where:{
//             id:1
//         }
//         ,include:[{
//             model:Card
//         }]
//     })
//     ctx.body = user
// })


module.exports = router
