/**
 * Created by zone on 2018/2/12.
 * 对接中控系统
 */
const superagent = require('superagent')
const Request = require('request');
const md5 = require('md5');
const config = require('../../config/config')

class CenterCtrl {
    getUrl(data) {//转化Url，转换成中控系统能够接收的格式
        let time = new Date().getTime().toString() + (Math.random() * 1000).toFixed(0);
        let requestParam = {
            appkey: config.CC_APP_KEY,
            signature: md5(time + config.CC_SECRET_KEY),
            timestamp: time,
            data: data
        };
        let base64Param = new Buffer(JSON.stringify(requestParam)).toString('base64');
        let url = config.CC_BASE_URL + config.CC_UTL_PATH + base64Param.replace(/\//g, '_');
        console.log("=========================== "+config.CC_BASE_URL)
        console.log("=========================== "+config.CC_BASE_URL)
        console.log("=========================== "+config.CC_BASE_URL)
        console.log("=========================== "+config.CC_BASE_URL)
        console.log("=========================== "+config.CC_BASE_URL)
        console.log("=========================== "+config.CC_BASE_URL)
        console.log("=========================== "+config.CC_BASE_URL)
        console.log("=========================== "+config.CC_BASE_URL)
        console.log("=========================== "+config.CC_BASE_URL)
        console.log("=========================== "+config.CC_BASE_URL)
        console.log("=========================== "+config.CC_BASE_URL)
        console.log("=========================== "+config.CC_BASE_URL)
        console.log("=========================== "+config.CC_BASE_URL)
        console.log("=========================== "+config.CC_BASE_URL)
        return url;
    }

    async cRrequest(data) {//封装的中控请求
        const url = this.getUrl(data);

        return await new Promise((resolve, reject) => {
            return Request(url, function (error, response, body) {
                if (!error) {
                    let data = JSON.parse(new Buffer(JSON.parse(body).result[0], 'base64').toString());
                    resolve(data);
                } else {
                    reject(error);
                }
            })
        });
    }

    async getUnpayOrder(station_id, gun_id) {
        let data = await this.cRrequest({
            method: 'GetOilRecord'
            , StationID: station_id
            , GunID: gun_id
        });
        return data;
    }


    getOrderID() {
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

    async wechatPay(stationId, fluid, payMoney, oilMount) {
        // let data = await this.getUnpayOrder(station_id, gun_id);
        let data2 = await this.cRrequest({
            method: 'SetMPay',
            StationID: stationId,
            Fluid: fluid,
            userid: '1',
            transaction_id: this.getOrderID(),
            PayMoney: payMoney,
            machMount: oilMount,//必须一致
            PayType: '6'
        })
        console.log(data2)
        return data2;
    }

    // async wechatPay(station_id, gun_id,pay_money){
    //     let data = await this.getUnpayOrder(station_id, gun_id);
    //     let data2 = await this.cRrequest({
    //         method: 'SetMPay',
    //         StationID: station_id,
    //         Fluid: data.data.OilRecord[0].Fluid,
    //         userid: '1',
    //         transaction_id: this.getOrderID(),
    //         PayMoney: pay_money,
    //         machMount: data.data.OilRecord[0].OilMount,//必须一致
    //         PayType: '6'
    //     })
    //     console.log(data2)
    //     return data2;
    // }

    async cardBind() {

    }

    async cardCreate() {

    }

    async cardGet() {

    }

    async cardPayCheck() {

    }

    async ledgerList() {

    }

    async orderGet() {

    }

    async orderUnPay() {

    }

    async orderPayByCard() {

    }

    async orderPayByWechat() {

    }

    async orderRecharge() {

    }

    async promotionList() {

    }


}

let centerCtrl = new CenterCtrl();
module.exports = centerCtrl
