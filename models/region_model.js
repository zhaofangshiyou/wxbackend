/**
 * Created by miah on 2018/5/7.
 * region数据操作类
 */

const MysqlModel = require('./server.mysql.model')
const Station = MysqlModel.get('Station');
const OilInfo = MysqlModel.get('OilInfo');
const OilGum = MysqlModel.get('OilGum');
const Oil = MysqlModel.get('Oil');
const Region = MysqlModel.get('Region');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Conn = require('../db/mysql_connection')

class RegionModel {
    async queryProvinceById(id){

        let ret = await Region.findAll({
            where : {
                id : id,
                type : "P"
            },
            limit : 1
        })

        return ret
    };
}

let regionModel = new RegionModel();
module.exports = regionModel