/*
 * create by zone on 2018/04/01
 * 微信工具集
 */
const superagent = require('superagent');
const config = require('../../config/config')
const crypto = require('crypto');
const md5 = crypto.createHash('md5');
class WX{
    async getOpenId(code){//获取 openId
        console.log(config.WX_APPID);
        let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.WX_APPID}&secret=${config.WX_SECRET}&js_code=${code}&grant_type=authorization_code`
        let data = await superagent
            .post(url)
        console.log(data.text)
        return data.text
    }

    async getAccessToken() {
        let url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.WX_APPID}&secret=${config.WX_SECRET}`
        let data = await superagent.post(url);
        let token = JSON.parse(data).access_token;
        // let tokenRes = await rp(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.WX_APPID}&secret=${config.WX_SECRET}`);
        return token;
    }


    async getNonceStr() {// 随机字符串，不长于32位。推荐随机数生成算法
        return Math.random().toString(36).substr(2, 15);
    };


    createTimestamp() {// 时间戳从1970年1月1日00:00:00至今的秒数，即当前的时间
        return parseInt(new Date().getTime() / 1000) + '';
    };

    raw(args) {
        let keys = Object.keys(args);
        keys = keys.sort();
        console.log("=========================>")
        console.log(keys)
        console.log("=========================>")
        let newArgs = {};
        keys.forEach(function (key) {
            newArgs[key] = args[key];
        });

        let str = '';
        for (let k in newArgs) {
            str += '&' + k + '=' + newArgs[k];
        }
        str = str.substr(1);
        return str;
    };

    //小程序 PaySign 2
    getPaySign(appid, nonce_str, package_, signType, timeStamp) {
        let ret = {
            appId: appid,
            timeStamp: timeStamp.toString(),
            nonceStr: nonce_str,
            package: package_,
            signType: signType
        };
        let str = this.raw(ret);
        let apiKey = config.WX_APIKEY; //key为商户平台设置的密钥key
        str = str + '&key=' + apiKey;
        console.log("拼接之后的字符串 => " + str)
        str = crypto.createHash('md5').update(str,'utf8').digest('hex').toUpperCase();
        console.log("加密之后的字符串 => " + str)

        return str;
    }

    //统一下单签名 1
    paysignjsapi(appid, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee) {
        let ret = {
            appid: appid,
            body: body,
            mch_id: mch_id,
            nonce_str: nonce_str,
            notify_url: notify_url,
            openid: openid,
            out_trade_no: out_trade_no,
            spbill_create_ip: spbill_create_ip,
            total_fee: total_fee,
            trade_type: 'JSAPI'
        };
        let str = this.raw(ret);
        let apiKey = config.WX_APIKEY; //key为商户平台设置的密钥key

        str = str + '&key=' + apiKey;
        console.log("拼接之后的字符串 => " + str)
        str = crypto.createHash('md5').update(str,'utf8').digest('hex').toUpperCase();
        console.log("加密之后的字符串 => " + str)

        return str;
    };

    // 示例：第一次签名需要的参数
    // let defaultParams = {
    //     appid: config.appid,
    //     mch_id: config.mchid,
    //     nonce_str: utils.createNonceStr(),
    //     body: '赞赏校友会',
    //     out_trade_no: createTradeNo(), //内部订单号
    //     total_fee: config.total_fee, //单位为分的标价金额
    //     spbill_create_ip: '220.112.231.8', //支付提交用户端ip
    //     notify_url: 'https://www.amusingcode.com/huse/base/notify', //异步接收微信支付结果通知
    //     trade_type: 'JSAPI',
    //     openid: 'oxNyk5Ip3PfL4tRiKostDa4nuIro'
    // }

    
    getWxPayOrdrID() {
        let myDate = new Date();
        let year = myDate.getFullYear();
        let mouth = myDate.getMonth() + 1;
        let day = myDate.getDate();
        let hour = myDate.getHours();
        let minute = myDate.getMinutes();
        let second = myDate.getSeconds();
        let msecond = myDate.getMilliseconds(); //获取当前毫秒数(0-999)
        if (mouth < 10) { /*月份小于10  就在前面加个0*/
            mouth = String('0' + String(mouth));
        }
        if (day < 10) { /*日期小于10  就在前面加个0*/
            day = String('0' + String(day));
        }
        if (hour < 10) { /*时小于10  就在前面加个0*/
            hour = String('0' + String(hour));
        }
        if (minute < 10) { /*分小于10  就在前面加个0*/
            minute = String('0' + String(minute));
        }
        if (second < 10) { /*秒小于10  就在前面加个0*/
            second = String('0' + String(second));
        }
        if (msecond < 10) {
            msecond = String('00' + String(second));
        } else if (msecond >= 10 && msecond < 100) {
            msecond = String('0' + String(second));
        }

        let currentDate = String(year) + String(mouth) + String(day) + String(hour) + String(minute) + String(second) + String(msecond);
        return currentDate;
    }
}

let wx = new WX();
module.exports = wx;