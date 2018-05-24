/**
 * Created by zone on 2018/1/5.
 */
class Config {
    dev() {//开发配置
        return {
            VERSION: 'v1'//系统版本
            //jwt
            , JWT_SECRET: "my secret"
            , JWT_EXPIRES_IN: "15d"
            //中控系统配置
            , CC_BASE_URL: 'http://112.74.97.234:36189/datasnap/rest/tservermethods1/'
            , CC_UTL_PATH: 'WXUniformInterface/'
            , CC_APP_KEY: '20230056'
            , CC_SECRET_KEY: 'CrQxcE12QV8'
            //小程序配置
            , WX_APPID: "wx1afccdc8d6f2f540"
            , WX_SECRET: "6d0a2c85a1cb71293438ee9ab5584598"
            // , WX_SECRET: "123qweasd!"
            //用于支付
            , WX_MCHID: "1495076042"
            , WX_APIKEY: "qYxW4tn3TDKqXL2wmy6AMuHBrnJAYJis"
            // , WX_APIKEY: "qYxW4tn3TDKqXL2wmy6AMuHBrnJAYJis"
            //MongoDB数据库，当前未使用
            , mongodb: "mongodb://zfdb:123qweasd!@123.207.242.77:37017/zfdb"
            //Redis connection parameter
            , REDIS_HOST: "123.207.242.77"
            , REDIS_PORT: "6378"
            , REDIS_PASSWORD: "rong3878200"
            //Mysql connection parameter
            , MYSQL_DATABASE: 'zfdb'  // 使用哪个数据库
            , MYSQL_USERNAME: 'root'  // 用户名
            , MYSQL_PASSWORD: '123qweasd!'  // 口令
            , MYSQL_HOST: '123.207.242.77'  // 主机名
            , MYSQL_PORT: 4407  // 端口号，MySQL默认3306
            //aliyun message sdk 阿里云短信服务
            , SMS_ACCESSKEY_ID: 'LTAI2GPxvDV0ov7v'
            , SMS_ACCESSKEY_SECRET: 'c2832hUkj4FKsH3F5npClbx8yMGcXd'
            //amap accesskey 高德地图
            , AMAP_URL: 'http://restapi.amap.com/v3/geocode/geo'
            , AMAP_ACCESS_KEY: 'c84398414907752d9ab6a268e6e480b0'

        };
    }

    pro() {//上线配置
        return {
            VERSION: 'v1'//系统版本
            //jwt
            , JWT_SECRET: "my secret"
            , JWT_EXPIRES_IN: "15d"
            //中控系统配置
            , CC_BASE_URL: 'http://39.108.215.95:36189/datasnap/rest/tservermethods1/'
            , CC_UTL_PATH: 'WXUniformInterface/'
            , CC_APP_KEY: '20230056'
            , CC_SECRET_KEY: 'CrQxcE12QV8'
            //小程序配置
            , WX_APPID: "wx1afccdc8d6f2f540"
            , WX_SECRET: "6d0a2c85a1cb71293438ee9ab5584598"
            //MongoDB数据库，当前未使用
            , mongodb: "mongodb://zfdb:123qweasd!@123.207.242.77:37017/zfdb"
            //Redis connection parameter
            , REDIS_HOST: "123.207.242.77"
            , REDIS_PORT: "6378"
            , REDIS_PASSWORD: "rong3878200"
            //Mysql connection parameter
            , MYSQL_DATABASE: 'zfdb'  // 使用哪个数据库
            , MYSQL_USERNAME: 'root'  // 用户名
            , MYSQL_PASSWORD: '123qweasd!'  // 口令
            , MYSQL_HOST: '123.207.242.77'  // 主机名
            , MYSQL_PORT: 4407  // 端口号，MySQL默认3306
            //aliyun message sdk
            , SMS_AccessKey_ID: 'LTAI2GPxvDV0ov7v'
            , SMS_AccessKey_Secret: 'c2832hUkj4FKsH3F5npClbx8yMGcXd'
        }
    }
}

let config = new Config();
let exportConfig = config.pro();//默认使用 development 配置

console.log("config :::" + exportConfig.SMS_AccessKey_ID)
console.log(" env ==> " + process.env.NODE_ENV)
if (process.env.NODE_ENV === 'production') {
    console.log("===============using=production=config===============");
    console.log("===============using=production=config===============");
    exportConfig = config.pro();
} else if (process.env.NODE_ENV === 'development') {
    console.log("===============using=development=config================")
    console.log("===============using=development=config================")
    exportConfig = config.dev();
}
else{
    console.log("===============undefined================")
    console.log("===============undefined================")
    exportConfig = config.dev();
}

module.exports = exportConfig