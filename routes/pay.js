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

router.get('/flow/orders', async (ctx, next) => {//在此处生成订单，并返回
    try {
        let {station_id, gun_id} = ctx.query;
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
            } else if (data.data == "无此记录") {
                ctx.body = {
                    status: 5
                    , msg: "no record" + data.data
                };
            } else {
                ctx.body = {
                    status: 6
                    , msg: "other error"
                };
            }
            return
        } else if (data.data.OilRecord.length <= 0) {
            ctx.body = {
                status: 4
                , msg: "no flow data."
            };
            return
        }
        let flow = data.data.OilRecord;
        console.log("orders ====>  " + JSON.stringify(flow))
        if (flow.length > 3) {
            flow = flow.slice(0, 3);
        }
        ctx.body = {
            status: 0
            , msg: "success"
            , data: {
                flow: flow
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


router.get('/flow/order', async (ctx, next) => {//在此处生成订单，并返回
    try {
        let {station_id, gun_id, oil_id, oil_type, write_money, user_id, Fluid} = ctx.query;
        console.log(ctx.query)
        let {name, type, card_prefix} = await Station.findOne({
            attributes: ['name', 'type', 'card_prefix']
            , where: {
                id: parseInt(station_id)
            }
        })
        console.log(" 油站类型（共享/自有）：" + type)
        if (oil_id && write_money) {//共享油站的处理分支
            let oilInfo = await OilInfo.findOne({
                attributes: ['name']
                , where: {
                    id: oil_id
                }
            })
            let trade_no = wx.getWxPayOrdrID()
            let order = await Order.create({
                user_id: user_id      //用户 id，通过关系生成
                , station_id: station_id      //油站 id，通过关系生成
                , trade_no: trade_no      //订单号
                , pay_status: "1"       //支付状态 0 - 支付，1 - 未支付
                , mount: write_money       //未参加优惠金额
                , pay_mount: write_money       //实际支付金额
                , good_name: oilInfo.name   //商品名
                , good_description: "商品描述"   //商品描述
                , discount: "0"      //折扣
                , gun_id: ""      //油枪号
                , oil_id: oil_id      //oil_id
                // , come_channel: DataTypes.STRING      //从第三方进入的通道
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
                    , trade_no: trade_no
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
            } else if (data.data == "无此记录") {
                ctx.body = {
                    status: 5
                    , msg: "no record" + data.data
                };
            } else {
                ctx.body = {
                    status: 6
                    , msg: "other error"
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
        let ccRecord;
        if (Fluid) {
            data.data.OilRecord.forEach((record, index) => {
                if (Fluid && record.Fluid && Fluid == record.Fluid) {
                    ccRecord = record;
                    console.log("生成订单 通过中控流水号来定位支付的订单，订单号为：" + Fluid)
                }
            })
        }

        let oilRecord = ccRecord;
        console.log("====> " + JSON.stringify(oilRecord))
        console.log("====> " + oilRecord.Oiltype)
        let {price} = await Oil.findOne({
            attributes: ['price']
            , where: {
                province_id: 2
                , name: oilRecord.Oiltype
            }
        })
        console.log("price ========> " + price)
        let att = common.exchangeOilType(oilRecord.Oiltype);//根据中控系统油品种类转换为自己的油品种类名称 例如：0#柴油 --> oil_0
        console.log(att)
        let attributes = []
        attributes[0] = att
        //根据不同种类的油品的折扣，计算优惠
        let oilTypeDiscount = await UserDiscountRule.findOne({
            attributes: [att, 'discount_date_end']
            , where: {
                // station_id: station_id
                // ,
                user_id: user_id
            }
            , order: [['amount_start', 'DESC']]
        })
        console.log("================ 优惠 =============> " + JSON.stringify(oilTypeDiscount))


        if (oilTypeDiscount == null) {//判断用户没有优惠的情况
            oilTypeDiscount = {att: 0}
        } else {
            let now = new Date();
            let time = new Date(oilTypeDiscount['discount_date_end'])
            console.log(" ================>   " + (time.getTime() - now.getTime()))
            if ((time.getTime() - now.getTime()) > 0) {
                console.log("============ 该用户拥有有效的优惠 =============")
            } else {
                oilTypeDiscount = {att: 0}
                console.log("============ 该用户当前优惠已过期 =============")
            }
        }
        if (!oilTypeDiscount[att]) {//判断用户没有优惠的情况
            oilTypeDiscount[att] = 0;
        }
        // let a = {a: 1,e:7}
        // let b = {b: 2,c:123,d:5}
        // let c = Object.assign(a,b)
        //实付金额=（发改委挂牌价-我们的优惠幅度）*实际加油升数
        //优惠金额=中控加油金额-实付金额

        console.log("加油单价 => " + price)
        console.log("加油优惠金额 => " + oilTypeDiscount[att])
        console.log("加油升数 => " + oilRecord.Lit)
        console.log("加油金额 => " + oilRecord.OilMount)
        let payMount = (price - oilTypeDiscount[att]) * oilRecord.Lit
        payMount = payMount.toFixed(2);
        console.log("支付金额 => " + payMount)
        if (payMount > parseFloat(oilRecord.OilMount)) {//判断支付金额大于实付金额的情况
            payMount = oilRecord.OilMount
            console.log("大于大于")
        }

        let discount = oilRecord.OilMount - payMount
        let lit = oilRecord.Lit
        let oilType = oilRecord.Oiltype
        let cc_flow_id = oilRecord.Fluid
        let mount = oilRecord.OilMount
        console.log("中控流水 id => " + oilRecord.Fluid)
        console.log(" oil type => " + oilType)
        console.log(" station id => " + station_id)
        console.log("折扣 => " + discount)
        if (discount == 0) {//优惠为零的时候，使用油站的总价
            payMount = oilRecord.OilMount
        }
        let {province_id} = await Station.findOne({
            where: {
                id: station_id
            }
        })
        let oil = await Oil.findOne({
            where: {
                province_id: province_id
            }
        })

        console.log("===============AAAAA===========")
        console.log(JSON.stringify(oil))
        let str = "payMount: " + payMount + " price: " + price + " oil_92: " + oilTypeDiscount[att] + " discount: " + discount + " oilRecord.OilMount: " + oilRecord.OilMount
        console.log("payMount: " + payMount + " price: " + price + " oil_92: " + oilTypeDiscount[att] + " discount: " + discount + " oilRecord.OilMount: " + oilRecord.OilMount)
        console.log(JSON.stringify(data))
        let trade_no = card_prefix + wx.getWxPayOrdrID()
        // let paramter = common.setParamter()
        // console.log(paramter)
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
            , amount: lit      //数量,升数
            , discount: discount      //折扣
            , gun_id: gun_id      //油枪号
            , oil_id: oil.oil_id      //oil_id
            // , come_channel: DataTypes.STRING      //从第三方进入的通道
        })

        ctx.body = {
            status: 0
            , msg: "success"
            , data: {
                Oiltype: oilRecord.Oiltype
                , Lit: oilRecord.Lit
                , OilMount: oilRecord.OilMount
                , PayMount: payMount
                , discount: discount.toFixed(2)
                , station_id: station_id
                , gun_id: gun_id
                , name: name
                , station_type: type
                , time: order.created_at
                , trade_no: cc_flow_id
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

router.post('/card', async (ctx, next) => {//卡支付
    try {
        console.log(ctx.request.body)
        let {user_id, station_id, gun_id, new_password, pay_money, discount, pay_channel, oil_id, Fluid} = ctx.request.body
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
        if (station_id && gun_id && gun_id != "_") {//处理自有油站的 card pay 分支
            let unPayOrder = await ct.getUnpayOrder(station_id, gun_id)

            if (typeof unPayOrder.data == "string") {//判断 station_id gun_id 是否合法
                if (unPayOrder.data == "站号错误2") {
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
            let ccRecord;
            if (Fluid) {
                unPayOrder.data.OilRecord.forEach((record, index) => {
                    if (Fluid && record.Fluid && Fluid == record.Fluid) {
                        ccRecord = record;
                        console.log("卡支付 通过中控流水号来定位支付的订单,订单号为：" + Fluid)

                    }
                })
            }

            let oilRecord = ccRecord
            let lit = oilRecord.Lit
            let oilType = oilRecord.Oiltype
            let cc_flow_id = oilRecord.Fluid
            let {province_id} = await Station.findOne({
                where: {
                    id: station_id
                }
            })
            let {price} = await Oil.findOne({
                attributes: ['price']
                , where: {
                    province_id: province_id
                }
            })
            let {id, person_balance} = await Card.findOne({
                where: {
                    user_id: user_id
                }
                , attributes: ['id', 'person_balance']
            })


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


            let payResult = await ct.wechatPay(station_id, oilRecord.Fluid, pay_money, oilRecord.OilMount, '8');
            console.log(payResult)
            let {data, code} = payResult

            if (code == 0) {// 中控支付成功标识 0 - 成功，1 - 失败
                console.log("中控支付成功")
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
                score += parseFloat(Math.round(lit));
                score = Math.round(score);
                console.log("score => " + score)

                //计算公益金
                welfare_amount += parseFloat((lit / 100).toFixed(2))

                console.log("total_vol => " + user.total_vol)
                console.log("total_vol 增加的量 => " + lit)
                console.log("total_vol 增加之后的 => " + total_vol)

                console.log("welfare_amount 原来 => " + user.welfare_amount)
                console.log("welfare_amount 增量 => " + (lit / 100).toFixed(2))
                console.log("welfare_amount => " + welfare_amount)


                if (total_vol > 0) {//更新个人加油升数,积分，不能为负数,生成积分流水
                    console.log("====================>  " + welfare_amount)
                    console.log("================= 存入数据库的 score ===>  " + score)
                    await User.update({
                        total_vol: total_vol
                        , welfare_amount: welfare_amount
                        , score: score

                    }, {
                        where: {
                            id: user_id
                        }
                    })
                    let score_str = "+ " + Math.round(lit);
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
                if (pay_channel) {
                    paramter["pay_channel"] = pay_channel
                }
                if (discount) {
                    paramter["deduction_amount"] = discount
                }
                paramter["is_invoicing"] = "1"

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
                ctx.body = {
                    status: 0
                    , msg: "success"
                };
            } else {
                console.log("中控支付失败")

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
            await Order.update({//更新订单状态，变成已经支付
                pay_status: "0"
            }, {
                where: {
                    user_id: user_id
                }
            })
            let order = await Order.findOne({
                where: {
                    user_id: user_id
                }
                , order: [['created_at', 'DESC']]

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
            console.log("==========================AAA")
            console.log(user_id)
            console.log(JSON.stringify(order))
            console.log(order.trade_no)
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
            total_fee = total_fee / 100//单位由分转化为元

            let user = await User.findOne({
                where: {
                    open_id: openid
                }
                , attributes: ['id', 'total_vol', 'score', 'welfare_amount']
            })
            console.log("== 微信支付回调：商户订单号 ==> " + out_trade_no)

            let order = await Order.findOne({
                where: {
                    user_id: user.id
                }
                , order: [['created_at', 'DESC']]
            })

            await Order.update({//更新订单状态，变成已经支付
                pay_status: "0"       //支付状态 0 - 支付，1 - 未支付
                , mount: total_fee       //支付金额
                // , pay_mount: order.mount       //支付金额
                , pay_mount: total_fee       //支付金额
                , discount: 0      //折扣
            }, {
                where: {
                    user_id: user.id
                }
                , order: [['created_at', 'DESC']]

            })
            let station = await Station.findOne({
                where: {
                    id: order.station_id
                }
            })
            // console.log(order)
            let card = await Card.findOne({
                where: {
                    user_id: user.id
                }
            })
            // let score = parseFloat(user.score)
            // score += parseFloat(lit);
            // await User.update({
            //     score: score
            // }, {
            //     where: {
            //         id: user.id
            //     }
            // })
            //添加消费流水
            console.log("=================")
            // console.log(order)
            let paramter = {}
            if (order.good_name) {
                paramter["oil_type"] = order.good_name
            }
            if (order.amount) {
                paramter["vol"] = order.amount
            }
            paramter["pay_channel"] = "3"
            if (order.discount) {
                paramter["deduction_amount"] = order.discount
            }
            paramter["is_invoicing"] = "1"
            if (order.pay_mount) {
                paramter["money"] = total_fee
            }
            let poundage = (parseFloat(total_fee) / 1000 * 3).toFixed(2)
            paramter["poundage"] = poundage

            if (card && card.id) {
                paramter["card_id"] = card.id
            }
            if (order.cc_flow_id) {
                paramter["cc_flow_id"] = order.cc_flow_id
            } else {
                paramter["cc_flow_id"] = order.trade_no
            }
            if (user.id) {
                paramter["user_id"] = user.id
            }
            if (station.name) {
                paramter["station_name"] = station.name
            }
            if (order.station_id) {
                paramter["station_id"] = order.station_id
            }
            if (order.oil_id) {
                paramter["oil_id"] = order.oil_id
            }
            if (order.gun_id) {
                paramter["oil_gum_num"] = order.gun_id
            }
            console.log("微信支付，生成加油流水参数 => ")
            console.log(paramter)
            console.log("===============================")
            let oilFlow = await OilFlow.create(paramter)
            let payResult = await ct.wechatPay(order.station_id, order.cc_flow_id, total_fee, order.mount, '41');

            //计算加油升数
            let lit = parseFloat(order.amount);
            let total_vol = parseFloat(user.total_vol);
            let welfare_amount = parseFloat(user.welfare_amount);
            total_vol += parseFloat(lit);
            total_vol = total_vol.toFixed(2)
            //计算公益金
            welfare_amount += parseFloat((lit / 100).toFixed(2))
            console.log("微信支付：total_vol 原来 => " + user.total_vol)
            console.log("微信支付：total_vol 增加的量 => " + lit)
            console.log("微信支付：total_vol 增加之后的 => " + total_vol)
            console.log("微信支付：welfare_amount 原来 => " + user.welfare_amount)
            console.log("微信支付：welfare_amount 增量 => " + (lit / 100).toFixed(2))
            console.log("微信支付：welfare_amount => " + welfare_amount)
            if (total_vol > 0) {//更新个人加油升数,积分，不能为负数,生成积分流水
                console.log("====================>  " + welfare_amount)
                await User.update({
                    total_vol: total_vol
                    , welfare_amount: welfare_amount
                }, {
                    where: {
                        id: user.id
                    }
                })
            }

            ctx.body =
                "<xml>\n" +
                "  <return_code><![CDATA[SUCCESS]]></return_code>\n" +
                "  <return_msg><![CDATA[OK]]></return_msg>\n" +
                "</xml>"
        }
        catch (e) {

            console.log(e)
        }

    }
)


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


        let {id, person_balance, unit_card_type, station_id} = await Card.findOne({
            attributes: ['id', 'person_balance', 'unit_card_type', 'station_id']
            , where: {
                user_id: user.id
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
        console.log("微信收款金额 => " + total_fee)
        console.log("微信手续费 => " + (parseFloat(total_fee) / 1000 * 3))
        let poundage = (parseFloat(total_fee) / 1000 * 3).toFixed(2)// total_fee/100/1000  单位转为元，再收 0.003 的手续费


        let chargeFlow = await ChargeFlow.create({
            user_id: user.id     //用户ID
            , money: total_fee   //充值金额
            , type: unit_card_type   //充值类型 <1 - 个人|2 - 单位>
            // , deduction_amount: DataTypes.DECIMAL(10, 2)   //优惠券抵扣金额
            , poundage: poundage  //手续费
            , card_id: id //卡号
        })
        //添加优惠券
        let discountRule = await DiscountRule.findAll({
            where: {
                station_id: station_id
            }
            // , attributes: ['amount_start']
            , order: [['amount_start', 'DESC']]


        })
        console.log("=======================?:::")
        console.log("=======================?:::")
        console.log("=======================?:::")
        console.log(JSON.stringify(discountRule))
        // total_fee = 8501
        let dayTime = 24 * 60 * 60 * 1000;
        let now = new Date();

        for (let index = 0; index < discountRule.length; index++) {
            console.log("============> >>>>>>>>  " + index)
            let rule = discountRule[index];
            if (index == 0 && total_fee >= rule.amount_start) {
                console.log("111111111111111111111111111111111111111")
                let discountEndTime = new Date(rule.discount_date_end)//计算优惠的截止日期，当前的日期大于优惠的截止日期时，不给当前优惠添加优惠
                if (now.getTime() > discountEndTime.getTime()) {
                    console.log("油站的规则日期已经过期。")
                    continue;
                }
                let cha = parseInt(rule.discount_days) * dayTime;
                let end = new Date(now.getTime() + cha)
                console.log("不过期，进入到规则生成阶段")
                console.log("不过期，进入到规则生成阶段")
                console.log("不过期，进入到规则生成阶段")
                console.log("= time => " + end.getTime())
                UserDiscountRule.create({
                    // oil_type: DataTypes.STRING       //油的种类
                    // , station_id: DataTypes.BIGINT(11)   //油站ID
                    oil_92: rule.oil_92   //92号油的优惠规则
                    , oil_95: rule.oil_95   //95号油的优惠规则
                    , oil_98: rule.oil_98   //98号油的优惠规则
                    , oil_0: rule.oil_0   //0号油的优惠规则
                    , oil_10: rule.oil_10   //-10号油的优惠规则
                    , oil_20: rule.oil_20   //-20号油的优惠规则
                    , amount_start: rule.amount_start   //优惠起始金额
                    , discount_type: rule.discount_type   //优惠类型，使用哪种优惠规则以此为判断
                    , discount_date_start: Date.now()   //优惠日期
                    , discount_date_end: end   //优惠日期
                    // , discount: {type: DataTypes.DECIMAL(10, 2), defaultValue: 0}   //折扣
                    , discount_days: rule.discount_days //折扣天数
                    , is_overlay: "1" //是否可以叠加优惠，0 - 叠加，1 - 不叠加
                    , user_id: user.id //
                    , station_id: station_id //
                }).then((udr) => {
                    console.log("生成了个人优惠规则 =====> ")
                    console.log("生成了个人优惠规则 =====> ")
                    console.log("生成了个人优惠规则 =====> " + udr)
                }).catch((e) => {
                    console.log(e)
                })
                console.log("  添加了优惠幅度的金额如下： ==> " + JSON.stringify(rule))
                break;
            } else if (total_fee >= rule.amount_start && total_fee < discountRule[index - 1].amount_start) {
                console.log("22222222222222222222222222222222222222222")
                let discountEndTime = new Date(rule.discount_date_end)//计算优惠的截止日期，当前的日期大于优惠的截止日期时，不给当前优惠添加优惠
                if (now.getTime() > discountEndTime.getTime()) {
                    console.log("油站的规则日期已经过期。")
                    continue;
                }
                let cha = parseInt(rule.discount_days) * dayTime;
                let end = new Date(now.getTime() + cha)
                console.log("= time => " + end.getTime())
                console.log("不过期，进入到规则生成阶段")
                console.log("不过期，进入到规则生成阶段")
                console.log("不过期，进入到规则生成阶段")
                UserDiscountRule.create({
                    // oil_type: DataTypes.STRING       //油的种类
                    // , station_id: DataTypes.BIGINT(11)   //油站ID
                    oil_92: rule.oil_92   //92号油的优惠规则
                    , oil_95: rule.oil_95   //95号油的优惠规则
                    , oil_98: rule.oil_98   //98号油的优惠规则
                    , oil_0: rule.oil_0   //0号油的优惠规则
                    , oil_10: rule.oil_10   //-10号油的优惠规则
                    , oil_20: rule.oil_20   //-20号油的优惠规则
                    , amount_start: rule.amount_start   //优惠起始金额
                    , discount_type: rule.discount_type   //优惠类型，使用哪种优惠规则以此为判断
                    , discount_date_start: Date.now()   //优惠日期
                    , discount_date_end: end   //优惠日期
                    // , discount: {type: DataTypes.DECIMAL(10, 2), defaultValue: 0}   //折扣
                    , discount_days: rule.discount_days //折扣天数
                    , is_overlay: "1" //是否可以叠加优惠，0 - 叠加，1 - 不叠加
                    , user_id: user.id //
                    , station_id: station_id //
                }).then((udr) => {
                    console.log("生成了个人优惠规则 =====> ")
                    console.log("生成了个人优惠规则 =====> ")
                    console.log("生成了个人优惠规则 =====> " + udr)
                }).catch((e) => {
                    console.log(e)
                })
                console.log("  添加了优惠幅度的金额如下： ==> " + JSON.stringify(rule))
                break;
            }
        }

        console.log("==============>>>>>>>>>>>" + JSON.stringify(discountRule))

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
        let {openid, pay_target, total_fee, good_description, oil_type, user_id, pay_mount, oil_mount} = ctx.query
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
        // total_fee = '1'; // 订单价格 单位是 分
        total_fee = Math.floor(total_fee * 100); // 订单价格 单位是 分
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