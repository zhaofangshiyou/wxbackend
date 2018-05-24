/*
 * create by zone on 2018/04/08
 * 用户注册，资料修改
 */
const router = require('koa-router')();
const config = require('../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const Ajv = require('ajv')
const schema = require('./utils/schema')
const MysqlModel = require('../models/server.mysql.model')
const User = MysqlModel.get('User');
const wx = require('./utils/wx');
let ajv = new Ajv();

router.prefix(`/${config.VERSION}/user`)

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

// router.use(koa_jwt({config.JWT_SECRET}))

router.post('/', async (ctx, next) => {//新增用户，并记录 openid 的值
    console.log("==> user");

    console.log(ctx.query)
    console.log(ctx.request.body)


    let {code} = ctx.request.body
    let res = await wx.getOpenId(code);
    let {session_key,openid} = JSON.parse(res)
    console.log("========================")
    console.log(`session => ${session_key}  openid => ${openid}`)
    console.log("========================")
    let user = await User.findOne({
        where: {
            open_id: openid

        }
    })
    if (!user) {
        user = await User.create({
            open_id: openid
            , welfare_amount: 0      //公益金
            , total_vol: 0  //累计加油*
            // mobile:mobile
        })
    }

    ctx.body = {
        status: 0
        , msg: 'success'
        , data: {
            user: user
        }
    }


})


router.get('/userId/:userId', async (ctx, next) => {//获取用户信息
    console.log("==> user");

    console.log(ctx.query)
    console.log(ctx.params.userID)
    console.log(ctx.request.body)
    let {name} = ctx.query
    let userID = ctx.params.userID
    let str = "get requers url params => " + userID + "other params => " + name;
    let user = await User.findOne({
        where: {
            id: parseInt(ctx.params.userId)
        }
    })
    ctx.body = {
        status: 0
        , msg: "seccess"
        , data: {
            user: user
        }
    }

})
router.put('/userId/:userId', async (ctx, next) => {//修改用户信息
    try {
        console.log("==> user");
        console.log(ctx.params)
        console.log(ctx.request.body)
        console.log("==> user");
        let {name, sex, id_card,car_num ,car_type } = ctx.request.body
        console.log(car_type)
        let userID = ctx.params.userID
        let str = "put requers url params => " + userID + "other params => " + name
        // 2018-5-16
        /*let idValidate = ajv.validate(schema.idcard, id_card);
        let carNumValidate = ajv.validate(schema.plateNum, car_num);
        if (idValidate) {
            console.log("是身份证")
        }else {
            console.log("bu是身份证")

        }
        if (carNumValidate) {
            console.log("是车牌")
        }else {

            console.log("bu是车牌")
        }

        */

        let user = await User.update({
            name: name       //用户姓名
            , sex: sex       //性别
            // , mobile: DataTypes.STRING   //手机号
            , id_card: id_card  //身份证
            , car_num: car_num  //车牌号
            , car_type: car_type  //车型号
        }, {
            where: {
                id: parseInt(ctx.params.userId)
            }
        })

        ctx.body = {
            status: 0
            , msg: "seccess"
        }
    } catch (error) {
        console.log(error)
        ctx.body = {
            status: 1
            , msg: "update fail"
        }
    }
})


router.delete('/:userId', async (ctx, next) => {//删，虚拟删除，数据库中还会保留数据
    console.log("==> delete")
    console.log(ctx.params.userId)
    let user = await User.destroy({
        where: {
            id: ctx.params.userId
        }
    })
    ctx.body = user
})


module.exports = router


//https://api.zfsyonline.com/v1/login/user/:userID
//put get delete
//return => put request ,url params => **** , other params => *****