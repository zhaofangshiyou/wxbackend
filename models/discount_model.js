/**
 * Created by miah on 2018/5/7.
 * 优惠数据操作类
 */

const MysqlModel = require('./server.mysql.model')
const Station = MysqlModel.get('Station');
const OilInfo = MysqlModel.get('OilInfo');
const Discount = MysqlModel.get('Discount');
const Region = MysqlModel.get('Region');
const Oil = MysqlModel.get('Oil');
const OilFlow = MysqlModel.get('OilFlow');
const DiscountRule = MysqlModel.get('DiscountRule');
const User = MysqlModel.get('User');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Conn = require('../db/mysql_connection')

class DiscountModel {
    //找到discount_rule的油品有哪些栏位
    async queryColumnFromDiscount(){
        let sql = "select * from information_schema.COLUMNS  "+
                   " where TABLE_SCHEMA = 'zfdb'  "+
                      "and TABLE_NAME = 'discount_rules' " +
                      "and COLUMN_NAME like 'oil_%'";
        let ret = await Conn.query(sql,{type: Sequelize.QueryTypes.SELECT});
        return ret;
    };
    
    //新增优惠规则
    async addDiscountRule(options){
        let ret = await DiscountRule.create(
            options
        )
        return ret;
    };

}

let discountModel = new DiscountModel;
module.exports = discountModel;