/*
 * create by zone on 2018/04/23
 * 兆方车上付
 */
const router = require('koa-router')();
const config = require('../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const crypto = require('crypto')
const MysqlModel = require('../models/server.mysql.model')
const Card = MysqlModel.get('Card');
const User = MysqlModel.get('User');
const Station = MysqlModel.get('Station');
const Oil = MysqlModel.get('Oil');
const OilInfo = MysqlModel.get('OilInfo');
const OilFlow = MysqlModel.get('OilFlow');
const ScoreFlow = MysqlModel.get('ScoreFlow');
const ChargeFlow = MysqlModel.get('ChargeFlow');
const DiscountRule = MysqlModel.get('DiscountRule');
const UserDiscountRule = MysqlModel.get('UserDiscountRule');
const Order = MysqlModel.get('Order');
const wx = require('./utils/wx')
const common = require('./utils/common')
const request = require('request')
const superagent = require('superagent');
const parseString = require('xml2js').parseString; // xml转js对象
const ct = require('./utils/center_ctrl')
router.prefix(`/${config.VERSION}/pay`)

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

router.get('/flow/order', async (ctx, next) => {//在此处生成订单，并返回
    try {
        let {station_id, gun_id, oil_id, oil_type, write_money, user_id} = ctx.query;
        console.log(ctx.query)
        let {name, type} = await Station.findOne({
            attributes: ['name', 'type']
            , where: {
                id: parseInt(station_id)
            }
        })
        console.log("===========================")
        console.log(type)
        if (oil_id && write_money) {//共享油站的处理分支
            let oilInfo = await OilInfo.findOne({
                attributes: ['name']
                , where: {
                    id: oil_id
                }
            })

            let order = await Order.create({
                user_id: user_id      //用户 id，通过关系生成
                , station_id: station_id      //油站 id，通过关系生成
                , trade_no: wx.getWxPayOrdrID()      //订单号
                , pay_status: "1"       //支付状态 0 - 支付，1 - 未支付
                , mount: write_money       //未参加优惠金额
                , pay_mount: write_money       //实际支付金额
                , good_name: oilInfo.name   //商品名
                , good_description: "商品描述"   //商品描述
                , discount: "0"      //折扣
            })

            console.log(order.created_at)
            ctx.body = {
                status: 0
                , msg: "success"
                , data: {
                    Oiltype: oilInfo.name
                    , Lit: "_"
                    , OilMount: write_money
                    , PayMount: write_money
                    , discount: "0"
                    , station_id: station_id
                    , gun_id: "_"
                    , name: name
                    , station_type: type
                    , time: order.created_at
                }
            };
            return
        }


        let data = await ct.getUnpayOrder(station_id, gun_id)//获取流水信息
        if (typeof data.data == "string") {//判断 station_id gun_id 是否合法
            if (data.data == "站号错误2") {
                ctx.body = {
                    status: 2
                    , msg: "station_id 错误，" + data.data
                };
            } else if (data.data == "获取流水错误") {
                ctx.body = {
                    status: 3
                    , msg: "gun_id 错误，" + data.data
                };
            }
            return
        } else if (data.data.OilRecord.length <= 0) {
            ctx.body = {
                status: 4
                , msg: "当前无流水信息。"
            };
            return
        }
        let {price} = await Oil.findOne({
            attributes: ['price']
            , where: {
                province_id: 2
            }
        })
        let att = common.exchangeOilType(data.data.OilRecord[0].Oiltype);//根据中控系统油品种类转换为自己的油品种类名称 例如：0#柴油 --> oil_0
        console.log(att)
        let attributes = []
        attributes[0] = att
        //根据不同种类的油品的折扣
        let oilTypeDiscount = await DiscountRule.findOne({
            attributes: [att]
            , where: {
                station_id: 1
            }
        })
        if (!oilTypeDiscount[att]) {
            oilTypeDiscount[att] = 0;
        }
        // let a = {a: 1,e:7}
        // let b = {b: 2,c:123,d:5}
        // let c = Object.assign(a,b)
        //实付金额=（发改委挂牌价-我们的优惠幅度）*实际加油升数
        //优惠金额=中控加油金额-实付金额

        console.log("加油单价 => " + price)
        console.log("加油优惠金额 => " + oilTypeDiscount[att])
        console.log("加油升数 => " + data.data.OilRecord[0].Lit)
        console.log("加油金额 => " + data.data.OilRecord[0].OilMount)
        let payMount = (price - oilTypeDiscount[att]) * data.data.OilRecord[0].Lit
        payMount = payMount.toFixed(2);
        console.log("支付金额 => " + payMount)
        let discount = data.data.OilRecord[0].OilMount - payMount
        let lit = data.data.OilRecord[0].Lit
        let oilType = data.data.OilRecord[0].Oiltype
        let cc_flow_id = data.data.OilRecord[0].Fluid
        let mount = data.data.OilRecord[0].OilMount


        console.log("折扣 => " + discount)


        let str = "payMount: " + payMount + " price: " + price + " oil_92: " + oilTypeDiscount[att] + " discount: " + discount + " data.data.OilRecord[0].OilMount: " + data.data.OilRecord[0].OilMount
        console.log("payMount: " + payMount + " price: " + price + " oil_92: " + oilTypeDiscount[att] + " discount: " + discount + " data.data.OilRecord[0].OilMount: " + data.data.OilRecord[0].OilMount)
        console.log(JSON.stringify(data))
        console.log("==> get")
        let trade_no = wx.getWxPayOrdrID()
        let order = await Order.create({
            user_id: user_id      //用户 id，通过关系生成
            , station_id: station_id      //油站 id，通过关系生成
            , trade_no: trade_no       //订单号
            , cc_flow_id: cc_flow_id      //订单号
            , pay_status: "1"       //支付状态 0 - 支付，1 - 未支付
            , mount: mount       //未参加优惠金额
            , pay_mount: payMount       //实际支付金额
            , good_name: oilType   //商品名
            , good_description: "商品描述"   //商品描述
            , price: price  //单价
            , amount: lit      //数量
            , discount: discount      //折扣
        })
        // let order = await Order.findOne({
        //     where:{
        //         trade_no:trade_no
        //     }
        // })
        // console.log(order)
        console.log(order.created_at)

        console.log("生成订单  ==> ")

        ctx.body = {
            status: 0
            , msg: "success"
            , data: {
                Oiltype: data.data.OilRecord[0].Oiltype
                , Lit: data.data.OilRecord[0].Lit
                , OilMount: data.data.OilRecord[0].OilMount
                , PayMount: payMount
                , discount: discount.toFixed(2)
                , station_id: station_id
                , gun_id: gun_id
                , name: name
                , station_type: type
                , time: order.created_at
            }
        };
    } catch (e) {
        console.log(e)
        ctx.body = {
            status: 1
            , msg: "error"
        };
    }
})

router.post('/card', async (ctx, next) => {
    try {
        console.log(ctx.request.body)
        let {user_id, station_id, gun_id, new_password, pay_money, discount, pay_channel, oil_id} = ctx.request.body
        let station = await Station.findOne({
            where: {
                id: station_id
            }
        })
        let md5 = crypto.createHash('md5')
        new_password = md5.update(new_password).digest('hex');
        console.log(new_password)
        let {password} = await Card.findOne({
            attributes: ['password']
            , where: {
                user_id: parseInt(user_id)
            }
        })
        //判断密码是否为空
        console.log(password)

        console.log(new_password + "   " + password)
        if (new_password != password) {
            console.log("密码错误")
            ctx.body = {
                status: 5
                , msg: "密码错误"
            };
            return
        }
        let order = await Order.findOne({
            where: {
                user_id: user_id
            }
        })
        if (station_id && gun_id) {//处理自有油站的 card pay 分支
            let unPayOrder = await ct.getUnpayOrder(station_id, gun_id)

            if (typeof unPayOrder.data == "string") {//判断 station_id gun_id 是否合法
                if (unPayOrder.data == "站号错误2") {
                    console.log("123")

                    ctx.body = {
                        status: 7
                        , msg: "station_id 错误，" + unPayOrder.data
                    };
                } else if (unPayOrder.data == "获取流水错误") {
                    console.log("4")

                    ctx.body = {
                        status: 6
                        , msg: "gun_id 错误，" + unPayOrder.data
                    };
                }
                return
            } else if (unPayOrder.data.OilRecord.length <= 0) {
                console.log("11111111111111")

                ctx.body = {
                    status: 4
                    , msg: "no flow data"
                };
                return
            }

            let lit = unPayOrder.data.OilRecord[0].Lit
            let oilType = unPayOrder.data.OilRecord[0].Oiltype
            let cc_flow_id = unPayOrder.data.OilRecord[0].Fluid
            let {price} = await Oil.findOne({
                attributes: ['price']
                , where: {
                    province_id: 2
                }
            })

            let payResult = await ct.wechatPay(station_id, unPayOrder.data.OilRecord[0].Fluid, pay_money, unPayOrder.data.OilRecord[0].OilMount);
            console.log(payResult)
            let {data, code} = payResult

            if (code == 0) {// 中控支付成功标识 0 - 成功，1 - 失败
                console.log("22222222222")

                let {id, person_balance} = await Card.findOne({
                    where: {
                        user_id: user_id
                    }
                    , attributes: ['id', 'person_balance']
                })
                let user = await User.findOne({
                    where: {
                        id: user_id
                    }
                    , attributes: ['id', 'total_vol', 'score', 'welfare_amount']
                })
                console.log("total_vol => " + user.total_vol)
                console.log("lit => " + lit)
                let total_vol = parseFloat(user.total_vol)
                let score = parseFloat(user.score)
                let welfare_amount = parseFloat(user.welfare_amount)

                console.log("score 原来 => " + score)
                console.log("score 增量 => " + lit)


                //计算加油升数
                total_vol += parseFloat(lit);
                total_vol = total_vol.toFixed(2)
                //计算积分
                score += parseFloat(lit);
                console.log("score => " + score)

                //计算公益金
                welfare_amount += parseFloat((lit / 100).toFixed(2))

                console.log("total_vol => " + user.total_vol)
                console.log("total_vol 增加的量 => " + lit)
                console.log("total_vol 增加之后的 => " + total_vol)

                console.log("welfare_amount 原来 => " + user.welfare_amount)
                console.log("welfare_amount 增量 => " + (total_vol / 100).toFixed(2))
                console.log("welfare_amount => " + welfare_amount)
                //计算个人卡余额
                console.log("person_balance 原来 => " + person_balance)

                person_balance = person_balance - parseFloat(pay_money)

                console.log("person_balance 增量 => " + pay_money)
                console.log("person_balance => " + person_balance)


                console.log(" 类型 => " + typeof person_balance)
                if (person_balance < 0) {
                    ctx.body = {
                        status: 3
                        , msg: "pay error,no enough money"
                    };
                    return
                }
                if (total_vol > 0) {//更新个人加油升数,积分，不能为负数,生成积分流水
                    console.log("====================>  " + welfare_amount)
                    await User.update({
                        total_vol: total_vol
                        , welfare_amount: welfare_amount
                        , score: score

                    }, {
                        where: {
                            id: user_id
                        }
                    })
                    let score_str = "+ " + score;
                    await ScoreFlow.create({
                        user_id: user_id     //用户ID，关联之后，后台生成
                        // , use_place: DataTypes.STRING   //使用地点
                        , score_description: score_str   //积分描述: + 30 / - 40
                        , description: "兆方卡支付"   //描述
                        // , commodity_id: DataTypes.STRING   //商品ID
                        // , use_at: DataTypes.DATE()   //使用时间
                    })

                }
                await Card.update({//更新个人余额，要加锁？
                    person_balance: person_balance
                }, {
                    where: {
                        user_id: user_id
                    }
                })
                await Order.update({//更新订单状态，变成已经支付
                    pay_status: "0"
                }, {
                    where: {
                        user_id: user_id
                    }
                })


                //添加消费流水
                let paramter = {}
                if (pay_money) {
                    paramter["money"] = pay_money
                }
                if (oilType) {
                    paramter["oil_type"] = oilType
                }

                if (lit) {
                    paramter["vol"] = lit
                }
                if (pay_money) {
                    paramter["money"] = pay_money
                }
                if (pay_channel) {
                    paramter["pay_channel"] = pay_channel
                }
                if (discount) {
                    paramter["deduction_amount"] = discount
                }
                paramter["is_invoicing"] = "1"
                if (pay_money) {
                    paramter["money"] = pay_money
                }
                if (id) {
                    paramter["card_id"] = id
                }
                if (cc_flow_id) {
                    paramter["cc_flow_id"] = cc_flow_id
                }

                if (station_id) {
                    paramter["station_id"] = station_id
                }
                // let station = await Station.findOne
                if (station.name) {
                    paramter["station_name"] = station.name
                }
                console.log("=================================>" + station.name)
                if (gun_id) {
                    paramter["oil_gum_num"] = gun_id
                }
                if (user.id) {
                    paramter["user_id"] = user.id
                }
                // oil_id: DataTypes.INTEGER
                let oilInfo = await OilInfo.findOne({
                    where: {
                        name: oilType
                    }
                    , attributes: ['id']
                })

                if (oilInfo.id) {
                    paramter["oil_id"] = oilInfo.id
                }
                let oilFlow = await OilFlow.create(paramter)
                console.log("card -> user_id => " + id)
                console.log("44444444444444")

                ctx.body = {
                    status: 0
                    , msg: "success"
                };
            } else {
                ctx.body = {
                    status: 2
                    , msg: "pay error"
                };
            }
        } else {//共享油站 card pay 分支
            let {id, person_balance} = await Card.findOne({
                where: {
                    user_id: user_id
                }
                , attributes: ['id', 'person_balance']
            })
            // let order1 = await Order.findOne({
            //     where: {
            //         user_id: user_id
            //     }
            // })
            console.log(" ===========>>>>>>>>>>>>>" + oil_id)
            console.log(" ===========>>>>>>>>>>>>>" + oil_id)
            console.log(" ===========>>>>>>>>>>>>>" + oil_id)
            let oilInfo = await OilInfo.findOne({
                attributes: ['name']
                , where: {
                    id: oil_id
                }
            })


            person_balance = person_balance - pay_money
            if (person_balance < 0) {
                ctx.body = {
                    status: 3
                    , msg: "pay error,no enough money"
                };
                return
            }
            await Card.update({//更新个人余额，要加锁？
                person_balance: person_balance
            }, {
                where: {
                    user_id: user_id
                }
            })

            let user = await User.findOne({
                where: {
                    id: user_id
                }
                , attributes: ['id', 'total_vol', 'score']
            })
            let order = await Order.update({//更新订单状态，变成已经支付
                pay_status: "0"
            }, {
                where: {
                    user_id: user_id
                }
            })


            //添加消费流水
            let paramter = {}
            if (pay_money) {
                paramter["money"] = pay_money
            }
            if (oilInfo.name) {
                paramter["oil_type"] = oilInfo.name
            }
            if (pay_money) {
                paramter["money"] = pay_money
            }
            if (pay_channel) {
                paramter["pay_channel"] = pay_channel
            }
            if (discount) {
                paramter["deduction_amount"] = discount
            }
            if (station_id) {
                paramter["station_id"] = station_id
            }
            if (station.name) {
                paramter["station_name"] = station.name
            }
            if (oil_id) {
                paramter["oil_id"] = oil_id
            }
            paramter["is_invoicing"] = "1"
            if (id) {
                paramter["card_id"] = id
            }
            if (user.id) {
                paramter["user_id"] = user.id
            }
            if (order.trade_no) {//由于共享油站无法获取到中控流水号，所以直接使用自家的订单流水号
                paramter["cc_flow_id"] = order.trade_no
            }
            console.log(paramter)
            let oilFlow = await OilFlow.create(paramter)
            console.log("card -> user_id => " + id)
            console.log("44444444444444")

            ctx.body = {
                status: 0
                , msg: "success"
            };
        }
    } catch (e) {
        console.log(e)
        ctx.body = {
            status: 1
            , msg: "程序内部错误"
        };
    }
})


router.all('/callback', async (ctx, next) => {//微信支付油钱的回调
        try {
            console.log("================================================================> get")
            console.log(ctx.request.body)
            console.log(ctx.query)
            let {xml} = ctx.request.body;
            let appid = xml.appid[0];
            let bank_type = xml.bank_type[0];
            let cash_fee = xml.cash_fee[0];
            let fee_type = xml.fee_type[0];
            let is_subscribe = xml.is_subscribe[0];
            let mch_id = xml.mch_id[0];
            let nonce_str = xml.nonce_str[0];
            let openid = xml.openid[0];
            let out_trade_no = xml.out_trade_no[0];
            let result_code = xml.result_code[0];
            let return_code = xml.return_code[0];
            let sign = xml.sign[0];
            let time_end = xml.time_end[0];
            let total_fee = xml.total_fee[0];
            let trade_type = xml.trade_type[0];
            let transaction_id = xml.transaction_id[0];

            console.log("bank_type => " + bank_type)
            console.log("cash_fee => " + cash_fee)
            console.log("fee_type => " + fee_type)
            console.log("is_subscribe => " + is_subscribe)
            console.log("mch_id => " + mch_id)
            console.log("nonce_str => " + nonce_str)
            console.log("openid => " + openid)
            console.log("out_trade_no => " + out_trade_no)
            console.log("result_code => " + result_code)
            console.log("return_code => " + return_code)
            console.log("sign => " + sign)
            console.log("time_end => " + time_end)
            console.log("total_fee => " + total_fee)
            console.log("trade_type => " + trade_type)
            console.log("transaction_id => " + transaction_id)
            console.log("===>")

            let user = await User.findOne({
                where: {
                    open_id: openid
                }
                , attributes: ['id', 'total_vol', 'score']
            })
            let order = await Order.findOne({
                where: {
                    trade_no: out_trade_no
                }
                // , include: [{
                //     model: Station
                // }]
            })
            let station = await Station.findOne({
                where: {
                    id: order.station_id
                }
            })
            console.log(order)

            await Order.update({//更新订单状态，变成已经支付
                pay_status: "0"
            }, {
                where: {
                    user_id: user.id
                }
            })
            let card = await Card.findOne({
                where: {
                    user_id: user.id
                }
            })
            let score = user.score
            score += user.total_vol;
            await User.update({
                score: score
            }, {
                where: {
                    id: user.id
                }
            })
            //添加消费流水
            let paramter = {}
            if (amount.good_name) {
                paramter["oil_type"] = amount.good_name
            }
            if (order.amount) {
                paramter["vol"] = order.amount
            }
            paramter["pay_channel"] = "3"
            if (order.discount) {
                paramter["deduction_amount"] = order.discount
            }
            paramter["is_invoicing"] = "1"
            if (order.pay_money) {
                paramter["money"] = order.pay_money
            }
            let poundage = (parseFloat(order.pay_money) / 1000).toFixed(2)
            paramter["poundage"] = poundage

            paramter["card_id"] = card.id
            if (order.cc_flow_id) {
                paramter["cc_flow_id"] = order.cc_flow_id
            }
            if (user.id) {
                paramter["user_id"] = user.id
            }
            if (station.name) {
                paramter["station_name"] = station.name
                // }
                console.log("===============================")
                console.log(paramter)
                console.log("===============================")
                let oilFlow = await OilFlow.create(paramter)


                ctx.body =
                    "<xml>\n" +
                    "  <return_code><![CDATA[SUCCESS]]></return_code>\n" +
                    "  <return_msg><![CDATA[OK]]></return_msg>\n" +
                    "</xml>"
            }
        }
        catch (e) {

            console.log(e)
        }

    }
)

router.post('/internel/callback', async (ctx, next) => {//兆方卡充值回调
    try {
        let {pay_money, oilType, lit, gun_id, discount, cc_flow_id, user_id} = ctx.request.body;

        let user = await User.findOne({
            where: {
                id: user_id
            }
            , attributes: ['id', 'total_vol']
        })

        let total_vol = user.total_vol
        total_vol += lit

        await User.update({
            total_vol: total_vol
        }, {
            where: {
                id: user_id
            }
        })

        let oilFlow = await OilFlow.create({
            money: pay_money   //加油金额
            , oil_type: oilType  //优品类别
            , vol: lit  //升数，加油生数
            , pay_channel: "1"      //支付通道（1 - 个人卡，2 - 单位卡，3 - 微信支付）
            // , station_id: {
            //     type: DataTypes.BIGINT(11)
            //     , allowNull: true
            // }     //油站ID
            , oil_gum_num: gun_id     //油枪号
            , deduction_amount: discount      //优惠券抵扣金额
            // , come_channel: DataTypes.STRING      //入口通道
            , is_invoicing: "1"      //是否开过发票
            // , poundage: DataTypes.DECIMAL(10, 2)  //手续费
            // , card_id: id //卡号
            // , oil_id: DataTypes.INTEGER //
            , cc_flow_id: cc_flow_id //中控流水 id
            , user_id: user_id //用户 id，加油的人

        })

    } catch (e) {
        console.log(e)
    }

})

router.all('/charge/callback', async (ctx, next) => {//兆方卡充值回调
    try {
        console.log("================================================================> get")
        console.log(ctx.request.body)
        console.log(ctx.query)
        let {xml} = ctx.request.body;
        let appid = xml.appid[0];
        let bank_type = xml.bank_type[0];
        let cash_fee = xml.cash_fee[0];
        let fee_type = xml.fee_type[0];
        let is_subscribe = xml.is_subscribe[0];
        let mch_id = xml.mch_id[0];
        let nonce_str = xml.nonce_str[0];
        let openid = xml.openid[0];
        let out_trade_no = xml.out_trade_no[0];
        let result_code = xml.result_code[0];
        let return_code = xml.return_code[0];
        let sign = xml.sign[0];
        let time_end = xml.time_end[0];
        let total_fee = xml.total_fee[0];
        let trade_type = xml.trade_type[0];
        let transaction_id = xml.transaction_id[0];

        console.log("bank_type => " + bank_type)
        console.log("cash_fee => " + cash_fee)
        console.log("fee_type => " + fee_type)
        console.log("is_subscribe => " + is_subscribe)
        console.log("mch_id => " + mch_id)
        console.log("nonce_str => " + nonce_str)
        console.log("openid => " + openid)
        console.log("out_trade_no => " + out_trade_no)
        console.log("result_code => " + result_code)
        console.log("return_code => " + return_code)
        console.log("sign => " + sign)
        console.log("time_end => " + time_end)
        console.log("total_fee => " + total_fee)
        console.log("trade_type => " + trade_type)
        console.log("transaction_id => " + transaction_id)
        console.log("===>")
        total_fee = total_fee / 100

        let user = await User.findOne({
            attributes: ['id']
            , where: {
                open_id: openid
            }
        })


        let {id, person_balance, unit_card_type} = await Card.findOne({
            attributes: ['id', 'person_balance', 'unit_card_type']
            , where: {
                user_id: user.id
            }
        })

        let order = await Order.findOne({
            where: {
                trade_no: out_trade_no
            }
        })

        person_balance = parseFloat(person_balance)
        person_balance += total_fee;
        console.log("  == 处于 100 之后的 total_fee  ==  ")
        console.log(total_fee)
        console.log("person_balance ==> " + person_balance)
        console.log("  == 处于 100 之后的 total_fee  ==  ")
        await Card.update({//更新个人余额，要加锁？
            person_balance: person_balance
        }, {
            where: {
                user_id: user.id
            }
        })
        let poundage = (parseFloat(total_fee) / 100000).toFixed(2)// total_fee/100/1000  单位转为元，再收 0.003 的手续费


        let chargeFlow = await ChargeFlow.create({
            user_id: user.id     //用户ID
            , money: total_fee   //充值金额
            , type: unit_card_type   //充值类型 <1 - 个人|2 - 单位>
            // , deduction_amount: DataTypes.DECIMAL(10, 2)   //优惠券抵扣金额
            , poundage: poundage  //手续费
            , card_id: id //卡号
        })


        //添加优惠券
        if (parseFloat(total_fee) > 5000) {
            await UserDiscountRule.create({
                oil_type: DataTypes.STRING       //油的种类
                // , station_id: DataTypes.BIGINT(11)   //油站ID
                , oil_92: DataTypes.STRING   //92号油的优惠规则
                , oil_95: DataTypes.STRING   //95号油的优惠规则
                , oil_98: DataTypes.STRING   //98号油的优惠规则
                , oil_0: DataTypes.STRING   //0号油的优惠规则
                , oil_10: DataTypes.STRING   //-10号油的优惠规则
                , oil_20: DataTypes.STRING   //-20号油的优惠规则
                , amount_start: {type: DataTypes.DECIMAL(10, 2), defaultValue: 0}   //优惠起始金额
                , discount_type: DataTypes.STRING   //优惠类型，使用哪种优惠规则以此为判断
                , discount_date_start: DataTypes.DATE()   //优惠日期
                , discount_date_end: DataTypes.DATE()   //优惠日期
                , discount: {type: DataTypes.DECIMAL(10, 2), defaultValue: 0}   //折扣
                , discount_days: DataTypes.INTEGER //折扣天数
                , is_overlay: {type: DataTypes.STRING, defaultValue: "0"} //是否可以叠加优惠，0 - 叠加，1 - 不叠加
                // , statin_id:    //油站ID
                , user_id: user.id
            })
        } else if (parseFloat(total_fee) > 1000) {

        }


        ctx.body =
            "<xml>\n" +
            "  <return_code><![CDATA[SUCCESS]]></return_code>\n" +
            "  <return_msg><![CDATA[OK]]></return_msg>\n" +
            "</xml>"

    } catch (e) {
        console.log(e)


    }

})

// router.use(koa_jwt({secret}))
router.all('/unifiedorder', async (ctx, next) => {
    try {
        let param = ctx.query || ctx.params;
        let {openid, pay_target, total_fee, good_description} = ctx.query
        // let user = await User.findOne({
        //     where:{
        //         id:2
        //     }
        //     ,attributes:['open_id']
        // })
        // let openid = user.open_id;
        console.log(ctx.query)
        console.log(ctx.request.body)
        console.log("=======================>  " + openid)
        let spbill_create_ip = ctx.ip.replace(/::ffff:/, ''); // 获取客户端ip
        let body = good_description || '兆方石油'; // 商品描述

        let notify_url = 'https://api.zfsyonline.com/v1/pay/callback';// 支付成功的回调地址  可访问 不带参数
        if (!pay_target) {
            ctx.body = {
                status: 2
                , msg: "pay_target "
            };
        } else if (pay_target == "charge") {
            notify_url = 'https://api.zfsyonline.com/v1/pay/charge/callback'
        } else if (pay_target == "pay") {
            notify_url = 'https://api.zfsyonline.com/v1/pay/callback'
        }
        let nonce_str = await wx.getNonceStr(); // 随机字符串
        let out_trade_no = wx.getWxPayOrdrID(); // 商户订单号
        total_fee = '1'; // 订单价格 单位是 分
        // total_fee = total_fee * 100; // 订单价格 单位是 分
        console.log("total_free ========>  " + total_fee)
        let timestamp = Math.round(new Date().getTime() / 1000); // 当前时间

        let bodyData = '<xml>';
        bodyData += '<appid>' + config.WX_APPID + '</appid>';  // 小程序ID
        bodyData += '<body>' + body + '</body>'; // 商品描述
        bodyData += '<mch_id>' + config.WX_MCHID + '</mch_id>'; // 商户号
        bodyData += '<nonce_str>' + nonce_str + '</nonce_str>'; // 随机字符串
        bodyData += '<notify_url>' + notify_url + '</notify_url>'; // 支付成功的回调地址
        bodyData += '<openid>' + openid + '</openid>'; // 用户标识
        bodyData += '<out_trade_no>' + out_trade_no + '</out_trade_no>'; // 商户订单号
        bodyData += '<spbill_create_ip>' + spbill_create_ip + '</spbill_create_ip>'; // 终端IP
        bodyData += '<total_fee>' + total_fee + '</total_fee>'; // 总金额 单位为分
        bodyData += '<trade_type>JSAPI</trade_type>'; // 交易类型 小程序取值如下：JSAPI
        // 签名
        let sign = wx.paysignjsapi(
            config.WX_APPID,
            body,
            config.WX_MCHID,
            nonce_str,
            notify_url,
            openid,
            out_trade_no,
            spbill_create_ip,
            total_fee
        );
        bodyData += '<sign>' + sign + '</sign>';
        bodyData += '</xml>';

        console.log("拼接后发送给微信服务器的 xml 数据 ===================> ");
        console.log(bodyData);
        console.log("===================");

        // 微信小程序统一下单接口
        let urlStr = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
        let firstResult = await superagent
            .post(urlStr)
            .send(bodyData)

        let returnValue = {};
        let parseResult;
        console.log(firstResult.text)
        await parseString(firstResult.text, function (err, result) {
            console.dir(" 转化为 json 之后的返回数据： ==>  " + JSON.stringify(result));
            parseResult = result
        });
        if (parseResult.xml.return_code[0] == 'SUCCESS') {
            returnValue.msg = '操作成功';
            returnValue.status = '100';
            returnValue.appid = config.WX_APPID
            returnValue.out_trade_no = out_trade_no;  // 商户订单号
            // 小程序 客户端支付需要 nonceStr,timestamp,package,paySign  这四个参数
            returnValue.nonceStr = parseResult.xml.nonce_str[0]; // 随机字符串
            timestamp = Math.round(new Date().getTime() / 1000); // 当前时间
            let timestamp2 = Math.round(new Date().getTime() / 1000); // 当前时间

            returnValue.timestamp = timestamp2.toString(); // 时间戳
            returnValue.package = 'prepay_id=' + parseResult.xml.prepay_id[0]; // 统一下单接口返回的 prepay_id 参数值
            let paySign = wx.getPaySign(config.WX_APPID, returnValue.nonceStr, returnValue.package, 'MD5', timestamp2); // 签名
            // let paySign = parseResult.xml.sign[0]; // 签名
            returnValue.paySign = paySign;
            console.log(JSON.stringify(returnValue))


            ctx.body = JSON.stringify(returnValue);
        } else {
            returnValue.msg = parseResult.xml.return_msg[0];
            returnValue.status = '102';
            ctx.body = JSON.stringify(returnValue);
        }

    } catch (e) {
        console.log(e)
        ctx.body = {
            status: 1
            , msg: "error"
        }
    }
});


module.exports = router