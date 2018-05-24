/**
 * Created by zone on 2018/2/12.
 * 对接中控系统
 */
const superagent = require('superagent')
const Request = require('request');
const md5 = require('md5');
const confog = require('../../config/config')

class CenterCtrl {
    getUrl(data) {//转化Url，转换成中控系统能够接收的格式
        let time = new Date().getTime().toString() + (Math.random() * 1000).toFixed(0);
        let requestParam = {
            appkey: Config.APP_KEY,
            signature: md5(time + Config.SECRET_KEY),
            timestamp: time,
            data: data
        };
        let base64Param = new Buffer(JSON.stringify(requestParam)).toString('base64');
        let url = Config.BASE_URL + Config.UTL_PATH + base64Param.replace(/\//g, '_');
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

    async getUppayOrder(StationID, GunID) {
        let data = await this.cRrequest({
            method: 'GetOilRecord'
            , StationID: StationID
            , GunID: GunID
        });
        return data;
    }

    async wechatPay(StationID,Fluid,PayMoney){
        let data = await this.cRrequest({
            method: 'SetMPay',
            StationID: StationID,
            Fluid: Fluid,
            userid: '1',
            transaction_id: '1',
            PayMoney: PayMoney,
            machMount: '0',
            PayType: '6'
        })
        return data;
    }

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
