/*
 * create by zone on 2018/04/08
 * 用于 Ajv 库的数据验证
 */

const GlobalConstant = require('./constant');

module.exports = {
    uuid: desc => ({
        type: "string",
        pattern: "^[a-fA-F0-9]{32}$",
        description: desc ? desc : "uuid"
    }),
    mobile: desc => ({
        type: "string",
        pattern: "^(13[0-9]|14[57]|15[012356789]|17[678]|18[0-9])[0-9]{8}$",
        description: desc ? desc : "手机号码，eg: 13800138000"
    }),
    idcard: desc => ({
        type: "string",
        pattern: "^\\d{17}\\d|[X]$",
        description: desc ? desc : "身份证，eg:440305199901012222"
    }),
    plateNum:desc => ({
        type: "string",
        pattern: "^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$",
        description: desc ? desc : "车牌号，eg： 粤B123v1"
    }),
    timestamp: desc => ({
        type: "integer",
        description: desc ? desc : "时间戳",
        minimum: 0
    }),
    money: desc => ({
        type: "integer",
        description: desc ? desc : "金额",
        minimum: 0
    }),
    rechargeMoney: desc => ({
        type: "integer",
        description: desc ? desc : "充值金额",
        minimum: 1
    }),
    gender: desc => ({
        type: "integer",
        enum: Object.values(GlobalConstant.Gender),
        description: desc ? desc : "性别:" + JSON.stringify(GlobalConstant.Gender),
    }),
    url: desc => ({
        type: "string",
        pattern: "^(.+)$",
        description: desc ? desc : "url"
    }),
    province: desc => ({
        type: "string",
        pattern: "^(.+)$",
        description: desc ? desc : "省份"
    }),
    city: desc => ({
        type: "string",
        pattern: "^(.+)$",
        description: desc ? desc : "城市"
    }),
    country: desc => ({
        type: "string",
        pattern: "^(.+)$",
        description: desc ? desc : "国家"
    }),
    longitude: desc => ({
        type: "string",
        pattern: "^[0-9]+(\.[0-9]+)?$",
        description: desc ? desc : "地址经度：117.77660"
    }),
    latitude: desc => ({
        type: "string",
        pattern: "^[0-9]+(\.[0-9]+)?$",
        description: desc ? desc : "地址纬度：30.926617"
    }),
    ip: desc => ({
        type:"string",
        pattern: "^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$",
        description: desc ? desc : "ip",
    }),
    date: desc => ({
        type:"string",
        pattern: "^[0-9]{4}\-[0-9]{1,2}\-[0-9]{1,2}$",
        description: desc ? desc : "日期",
    }),
    dateTime: desc => ({
        type:"string",
        pattern: "^[0-9]{4}\-[0-9]{1,2}\-[0-9]{1,2}\s[0-9]{1,2}\:[0-9]{1,2}\:[0-9]{1,2}$",
        description: desc ? desc : "日期",
    }),
    captcha: desc => ({
        type: "string",
        description: desc ? desc : "手机验证码",
        pattern: "^[0-9]{4}$"
    }),
    password: desc => ({
        type: "string",
        pattern: "^[a-fA-F0-9]{32}$",
        description: desc ? desc : "md5加密密码，eg: AF02AF02AF02AF02AF02AF02AF02AF02"
    }),
    rawPassword: desc => ({
        type: "string",
        pattern: "^[0-9]{6}$",
        description: desc ? desc : "原始明文密码，eg: 123456"
    }),
    station: {
        id: desc => ({
            type: "string",
            pattern: "^[0-9]{1,8}$",
            description: desc ? desc : "加油站ID"
        }),
        name: desc => ({
            type: "string",
            pattern: "^.{3,20}$",
            description: desc ? desc : "加油站名称"
        }),
        address: desc => ({
            type: "string",
            pattern: "^.+$",
            description: desc ? desc : "加油站地址"
        }),
    },
    customer: {
        id: desc => ({
            type: "string",
            description: desc ? desc : "顾客ID",
            pattern: "^[0-9]{8,12}$"
        }),
        nickname: desc => ({
            type: "string",
            pattern: "^(.+)$",
            description: desc ? desc : "顾客昵称"
        }),
        avatar: desc => ({
            type: "string",
            pattern: "^(.+)$",
            description: desc ? desc : "顾客头像"
        }),
    },
    card: {
        id: desc => ({
            type: "string",
            description: desc ? desc : "兆方卡ID",
            pattern: "^\\d{8}$"
        }),
        status: desc => ({
            type: "integer",
            description: desc ? desc : "兆方卡状态:" + JSON.stringify(GlobalConstant.Card.Status),
            enum: Object.values(GlobalConstant.Card.Status),
        }),
        level: desc => ({
            type: "string",
            description: desc ? desc : "卡优惠代号",
            pattern: "^[0-19]$"
        })
    },

    order: {
        id: desc => ({
            type: "string",
            pattern: "^[A-Z0-9]{19}$",
            description: desc ? desc : "订单ID"
        }),
        type: desc => ({
            type: "integer",
            enum: Object.values(GlobalConstant.Order.Type),
            description: desc ? desc : "订单消费类型:" + JSON.stringify(GlobalConstant.Order.Type)
        }),
        payment:{
            type: desc => ({
                type: "integer",
                enum: Object.values(GlobalConstant.Order.Payment.Type),
                description: desc ? desc : "支付方式:" + JSON.stringify(GlobalConstant.Order.Payment.Type)
            }),
            referenceId: desc => ({
                type: "string",
                pattern: "^.{8,}$",
                description: desc ? desc : "支付该笔订单的支付对象ID，加油卡：卡ID；微信：微信ID"
            })
        },
        status: desc => ({
            type: "integer",
            enum: Object.values(GlobalConstant.Order.Status),
            description: desc ? desc : "订单状态:" + JSON.stringify(GlobalConstant.Order.Status)
        }),
        invoiceStatus: desc => ({
            type: "integer",
            enum: Object.values(GlobalConstant.Order.InvoiceStatus),
            description: desc ? desc : "开发票状态:" + JSON.stringify(GlobalConstant.Order.InvoiceStatus)
        }),
    },
    controlCenter:{
        oilGunNo: desc => ({
            type: "string",
            pattern: "^[0-9]+$",
            description: desc ? desc : "油枪编号"
        }),
        ttc: desc => ({
            type:"string",
            pattern: "^[0-9]+$",
            description:"中控系统交易流水号"
        }),
        oilVariety: desc => ({
            type: "string",
            enum:["0", "92", "95", "98"],
            description:"中控系统支持的油品"
        })
    },
    promotion:{
        deposit:{
            id: desc => ({
                type: "string",
                pattern: "^[a-fA-F0-9]{32}$",
                description: desc ? desc : "充值套餐ID"
            }),
            status: desc => ({
                type: "integer",
                enum: Object.values(GlobalConstant.Promotion.Deposit.Status),
                description: desc ? desc : '套餐状态:' + JSON.stringify(GlobalConstant.Promotion.Deposit.Status)
            })
        }
    },
    statistics: {
        record: {
            id: desc => ({
                type: "string",
                pattern: "^[a-fA-F0-9]{32}$",
                description: desc ? desc : "统计记录ID"
            }),
            event: desc => ({
                type: "integer",
                enum: Object.values(GlobalConstant.Statistics.Record.Event),
                description: desc ? desc : "统计记录类型"
            })
        }
    },
    wechat:{
        id: desc => ({
            type: "string",
            pattern: "^(.+)$",
            description: desc ? desc : "微信ID"
        }),
        appId: desc => ({
            type: 'string',
            pattern: '^.{0,20}$',
            description: '公众号id'
        }),
        nonceStr: desc => ({
            type: 'string',
            pattern: '^.{0,32}$',
            description: '随机字符串'
        }),
        oauthCode: desc => ({
            type:"string",
            pattern: "^(.*)$",
            description:"微信授权回调code"
        }),
        orderId: desc => ({
            type:"string",
            pattern:"^[0-9a-zA-Z-_\|\*\@]{1,32}",
            description:"商户订单号"
        }),
        title: desc => ({
            type:"string",
            pattern: "^(.*){1,128}$",
            description:"商品描述"
        }),
        detail: desc => ({
            type:"string",
            pattern: "^(.*){1,6000}$",
            description:"商品详情"
        }),
        signType: desc => ({
            type:"string",
            enum: ['MD5'],
            description:"微信签名加密参数"
        }),
        order: {
            package: desc => ({
                type: 'string',
                pattern: '^\\S{1,128}$',
                description: '订单详情扩展字符串'
            }),
            paySign: desc => ({
                type: 'string',
                pattern: '^.{0,64}$',
                description: '签名'
            })
        }
    },
    management:{
        account: desc => ({
            type: "string",
            pattern: "^.{2,10}$",
            description: desc ? desc : "管理后台账户",
        }),
        password: desc => ({
            type: "string",
            pattern: "^[0-9a-zA-Z]{6,16}$",
            description: desc ? desc : "管理后台密码",
        })
    }
};