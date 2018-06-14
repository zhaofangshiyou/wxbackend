/**
 * Created by miah on 2018/5/7.
 * 小程序query.js操作类
 */

const MysqlModel = require('./server.mysql.model')
const Station = MysqlModel.get('Station');
const OilInfo = MysqlModel.get('OilInfo');
const Discount = MysqlModel.get('Discount');
const Refund = MysqlModel.get('Refund');
const Oil = MysqlModel.get('Oil');
const OilFlow = MysqlModel.get('OilFlow');
const Card = MysqlModel.get('Card');
const User = MysqlModel.get('User');
const BackendUser = MysqlModel.get('BackendUser');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Conn = require('../db/mysql_connection')

class QueryModel {
    //发票
    async queryOilFlowList(msg_type,userId,is_invoicing,page_num,num){

        let sql = "SELECT of.* , caoncat(c.card_prefix, LPAD(c.id,8,0)) as card_no from oil_flows of , cards c ,users u"+
                " where of.card_id = c.id and of.deleted_at is null "+
                "   and c.deleted_at is null and u.id = c.user_id  "+
                "   and u.deleted_at is null "

        if (msg_type && msg_type!=""){
            sql = sql + " and c.unit_card_type = :type "
        }

        if (userId && userId!=""){
            sql = sql + " and u.id = :id "
        }

        if (is_invoicing && is_invoicing!=""){
            sql = sql + " and of.is_invoicing = :is_invoicing "
        }

        sql = sql + " order by of.created_at desc "
        if((page_num>=0) && (num>0)) {
            sql = sql + " limit :page, :num";
        }
   
        let ret = await Conn.query(sql,{replacements:{type:msg_type, id:userId,
            is_invoicing:is_invoicing, page:page_num*num,
                num:num},type: Sequelize.QueryTypes.SELECT});

        return ret ;
    };
    
    //充值
    async queryChargeFlowList(msg_type,userId,page_num,num){

        let sql = "SELECT of.* from charge_flows of , cards c ,users u"+
                " where of.card_id = c.id and of.deleted_at is null "+
                "   and c.deleted_at is null and u.id = c.user_id  "+
                "   and u.deleted_at is null "

        if (msg_type && msg_type!=""){
            sql = sql + " and c.unit_card_type = :type "
        }

        if (userId && userId!=""){
            sql = sql + " and u.id = :id "
        }

        sql = sql + " order by of.created_at desc "
        if((page_num>=0) && (num>0)) {
            sql = sql + " limit :page, :num";
        }
   
        let ret = await Conn.query(sql,{replacements:{type:msg_type, id:userId, page:page_num*num,
                num:num},type: Sequelize.QueryTypes.SELECT});

        return ret ;
    };
}

let queryModel = new QueryModel;
module.exports = queryModel;