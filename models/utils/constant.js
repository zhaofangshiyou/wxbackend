//readme：对于constant的定义不要用0，0用作了model的默认值
//constant 不变的
module.exports = {
    Card: {
        Status: {
            INACTIVE: 0,
            LOCKED: 1,
            ACTIVATED: 2
        },
        Source: {
            CREATED: 0,
            BOUND: 1
        },
        PayStatus: {
            NORMAL : 1,
            INSUFFICIENT_BALANCE : 2,
            OIL_VARIETY_MISMATCH : 3,
            OTHER_ERROR : 4,
        }
    },
    Gender: {
        MALE: 1,
        FEMALE: 2,
        UNKNOWN: 3,
    },
    Order: {
        Type: {
            OIL: 1,
            RECHARGE: 2
        },
        Payment : {
            Type: {
                WECHAT : 1,
                CARD : 2
            }
        },
        Status: {
            PENDING: 1,
            FINISHED: 2,
            SHIPMENT_FAILED: 3,
            CANCELED: 4
        },
        InvoiceStatus: {
            PENDING: 1,
            ISSUED: 2,
            NOT_AVAILABLE: 3
        }
    },
    Statistics: {
        Record: {
            Event: {
                OIL_PURCHASED: 1,
                RECHARGED: 2,
                REBATE_GRANTED: 3,
                REBATE_COMMITTED: 4,
                CARD_CREATED: 5
            }
        }
    },
    Captcha: {
        GetStatus: {
            SUCCESS: 1,
            FREQUENCY_LIMIT: 2,
        },
        CheckStatus: {
            SUCCEED : 0,
            FAILED  : 1,
            EXPIRED : 2,
        }
    },
    Management: {
        BehaviorLogger: {
            ActionType: {
                CHANGE_CUSTOMER_MOBILE: 1,
                CHANGE_CUSTOMER_TRANSACTION_PASSWORD: 2,
                ON_SHELF_PROMOTION_DEPOSIT: 3,
                OFF_SHELF_PROMOTION_DEPOSIT: 4
            }
        }
    },
    SwiftPayment: {
        Service: {
            WECHAT: 'wx.gateway.h5pay'
        },
        TradeStatus: {
            SUCCESS: 'SUCCESS',
            FAILED: 'FAIL'
        },
        IsSubscribe: {
            TRUE: true,
            FALSE: false
        }
    }
};
