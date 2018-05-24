/*
 * create by zone on 2018/04/01
 * 短信
 */
const DysmsapiClient = require('@alicloud/dysmsapi')
const DybaseapiClient = require('@alicloud/dybaseapi')
const MNSClient = require('@alicloud/mns')
const redisUtil = require('./redis_util')
const Config = require('./../../config/config')

// 阿里云短信平台
// 短信回执报告：SmsReport，短信上行：SmsUp
const msgTypeList = ["SmsReport", "SmsUp"]

const DYSMSAPI_ENDPOINT = 'http://dysmsapi.aliyuncs.com'
const DYBASEAPI_ENDPOINT = 'http://dybaseapi.aliyuncs.com'


class SMSClient {
    constructor(accessKeyId = Config.SMS_ACCESSKEY_ID, secretAccessKey = Config.SMS_ACCESSKEY_SECRET) {
        // let {accessKeyId, secretAccessKey} = options
        // accessKeyId = accessKeyId || Config.SMS_AccessKey_ID
        // secretAccessKey = secretAccessKey || Config.SMS_AccessKey_Secret

        if (!accessKeyId) {
            throw new TypeError('parameter "accessKeyId" is required');
        }
        if (!secretAccessKey) {
            throw new TypeError('parameter "secretAccessKey" is required');
        }
        this.dysmsapiClient = new DysmsapiClient({accessKeyId, secretAccessKey, endpoint: DYSMSAPI_ENDPOINT})
        this.dybaseClient = new DybaseapiClient({accessKeyId, secretAccessKey, endpoint: DYBASEAPI_ENDPOINT})
        this.expire = []
        this.mnsClient = []
    }

    //发送短信
    sendSMS(params) {
        return this.dysmsapiClient.sendSms(params)
    }

    async verifyCode(code, mobile) {
        let result = await redisUtil.get(mobile)
        return code == parseInt(result)
    }

    //查询详情
    queryDetail(params) {
        return this.dysmsapiClient.querySendDetails(params)
    }

    //失效时间与当前系统时间比较，提前2分钟刷新token
    _refresh(type) {
        return this.expire[type] - new Date().getTime() > 2 * 60 * 1000
    }

    //获取token
    _getToken(type) {
        let msgType = msgTypeList[type]
        return this.dybaseClient.queryTokenForMnsQueue({MessageType: msgType})
    }

    //根据类型获取mnsclient实例
    async _getMNSClient(type) {
        if (this.mnsClient && (this.mnsClient[type] instanceof MNSClient) && this._refresh(type)) {
            return this.mnsClient[type]
        }

        let {
            MessageTokenDTO: {
                SecurityToken,
                AccessKeyId,
                AccessKeySecret
            }
        } = await this._getToken(type)


        if (!(AccessKeyId && AccessKeySecret && SecurityToken)) {
            throw new TypeError('get token fail')
        }


        let mnsClient = new MNSClient('1943695596114318', {
            securityToken: SecurityToken,
            region: 'cn-hangzhou',
            accessKeyId: AccessKeyId,
            accessKeySecret: AccessKeySecret,
            // optional & default
            secure: false, // use https or http
            internal: false, // use internal endpoint
            vpc: false // use vpc endpoint
        })
        this.mnsClient[type] = mnsClient
        this.expire[type] = (new Date().getTime() + 10 * 60 * 1000)
        return mnsClient
    }

    //typeIndex :0 为回执,1为上行
    async receiveMsg(typeIndex = 0, preQueueName, waitSeconds = 10) {
        let mnsClient = await this._getMNSClient(typeIndex)
        return await mnsClient.receiveMessage(preQueueName + msgTypeList[typeIndex], waitSeconds)
    }

}

let sms = new SMSClient();
module.exports = sms




