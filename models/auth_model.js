
/**
 * Created by miah on 2018/5/7.
 * 用户数据操作类
 */

const MysqlModel = require('./server.mysql.model')
const Station = MysqlModel.get('Station');
const OilInfo = MysqlModel.get('OilInfo');
const BackendUser = MysqlModel.get('BackendUser');
const Region = MysqlModel.get('Region');
const Oil = MysqlModel.get('Oil');
const OilFlow = MysqlModel.get('OilFlow');
const DiscountRule = MysqlModel.get('DiscountRule');
const User = MysqlModel.get('User');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Conn = require('../db/mysql_connection')

class AuthModel {
    async loginAuth(login, password){
        let ret = await BackendUser.findAll({
            attributes : ["id","login","name",["permissions","authId"],"admin","role"],
            where : {
                login : login ,
                password : password
            },
            limit : 1
        })
        return ret ;
    };

    async queryUserById(id){
        let ret = await BackendUser.findAll({
            attributes : ["id","login","name",["permissions","authId"],"admin","role"],
            where : {
                id : id
            },
            limit : 1
        })
        return ret ;
    };
}

let authModel = new AuthModel;
module.exports = authModel;