/**
 * Created by miah on 2018/5/7.
 * 优惠数据操作类
 */

const MysqlModel = require('./server.mysql.model')
const Station = MysqlModel.get('Station');
const OilInfo = MysqlModel.get('OilInfo');
const Discount = MysqlModel.get('Discount');
const DiscountDoc = MysqlModel.get('DiscountDoc');
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
        let sql = "select COLUMN_NAME from information_schema.COLUMNS  "+
                   " where TABLE_SCHEMA = 'zfdb'  "+
                      "and TABLE_NAME = 'discount_rules' " +
                      "and COLUMN_NAME like 'oil_%'";
        let ret = await Conn.query(sql,{type: Sequelize.QueryTypes.SELECT});
        return ret;
    };
    
    //新增优惠规则
    async addDiscountRule(options){
        let ret = await DiscountRule.bulkCreate(
            options
        )
        return ret;
    };

    //根据id查找优惠规则列表
    async queryDiscountRuleById(id){
        let ret = await DiscountRule.findAll({
            where :{
                id : id
            }
        })
        return ret;
    };

    //删除优惠规则
    async delDiscountRule(ids){
        let ret = await DiscountRule.destroy(
            {
                where: {
                    id:{
                        [Op.in]:ids
                    }
                }
            }
        )
        return ret ;
    };

    //更新
    async updDiscountRuleById(id,options){
        let ret = await DiscountRule.update(
            options,
            {where :{
                id : id
            }}
        )
        return ret;
    };

    //查找优惠规则列表
    async queryDiscountRuleList(options){
        let province_id = options.province_id;
        let station_id = options.station_id;
        let begin_time = options.begin_time;
        let end_time = options.end_time;
        let page_num = options.page_num;
        let num = options.num;
        let sql = "";

        if (province_id && province_id != ""){
            sql = sql + " and sta.province_id = :province_id ";
        }

        if (station_id && station_id != ""){
            sql = sql + " and sta.id = :station_id ";
        }

        if (begin_time && begin_time != ""){
            sql = sql + " and dr.discount_date_end >= :begin_time ";
        }

        if (end_time && end_time != ""){
            sql = sql + " and dr.discount_date_end <= :end_time ";
        }
        
        let sql_main = "SELECT sta.province_id, " +
                "   sta.province, " +
                "   sta.name as station_name, " +
                "   dr.*, "+
                "   date_format(dr.discount_date_start,'%Y-%m-%d %H:%i:%s') "+
                "       as discount_begin_time, " +
                "   date_format(dr.discount_date_end,'%Y-%m-%d %H:%i:%s')" +
                "       as discount_end_time" +
                "  FROM "+
                "   stations sta, discount_rules dr "+
                "  WHERE sta.id = dr.station_id" + sql;
        if ((page_num>=0) && (num>0)) {
            sql_main = sql_main + " limit :page, :num";
        }

        let ret = await Conn.query(sql_main,{
            replacements: {province_id:parseInt(province_id),
                    station_id:parseInt(station_id),
                    begin_time:begin_time, end_time:end_time,
            page:(page_num*num), num:num},type: Sequelize.QueryTypes.SELECT});
        return ret;
    };

    //新增优惠规则文案
    async addDiscountDoc(options){
        let ret = await DiscountDoc.create(options)
        return ret;
    };

    //根据标题查找文案
    async queryDiscountDocByTitle(title){
        let ret = await DiscountDoc.findAll({
            where : {
                title  : title
            }
        })
        return ret;
    }


    async queryDiscountDoc(options, page_num ,num){
        let id = parseInt(options.id)
        let title = options.title
        let begin_time = options.begin_time
        let end_time = options.end_time
        let sql = ""
        
        if (id && (id != "")) {
            sql = sql + " and id = :id ";
        }

        if (title && (title != "")) {
            sql = sql + " and title like :title ";
        }

        if (begin_time && (begin_time != "")) {
            sql = sql + " and created_at >= begin_time ";
        }

        if (end_time && (end_time != "")) {
            sql = sql + " and created_at <= end_time ";
        }

        let sql_main = "select id,title,content, " +
            "date_format(created_at,'%Y-%m-%d %H:%i:%s') as created_time ,"+
            "date_format(updated_at,'%Y-%m-%d %H:%i:%s') as updated_time "+
            " from discount_docs  "+
            " where deleted_at is null " + sql;
        if ((page_num>=0) && (num>0)) {
            sql_main = sql_main + " limit :page, :num "
        }

        let ret = await Conn.query(sql_main,{
            replacements: {id:id,title:'%'+title+'%',begin_time:begin_time, 
                    end_time:end_time,page:(page_num*num), num:num},
                    type: Sequelize.QueryTypes.SELECT});
    
        /*
        let ret = await DiscountDoc.findAll({
            where : {
                id : id,
                title : {[Op.like] : "%"+title+"%"},
                created_at : {[Op.gte]:begin_time},
                created_at : {[Op.lte]:begin_time}
            },
        })

        if ((page_num>=0) && (num>0)) {
            ret = await DiscountDoc.findAll({
                where : {
                    id : id,
                    title : {[Op.like] : "%"+title+"%"},
                    created_at : {[Op.gte]:begin_time},
                    created_at : {[Op.lte]:begin_time}
                },
                offset : page_num*num,
                limit : num
            })
        }
        */
        return ret;
    };

    //删除优惠规则文案
    async delDiscountRuleDoc(ids){
        let ret = await DiscountDoc.destroy(
            {
                where: {
                    id:{
                        [Op.in]:ids
                    }
                }
            }
        )
        return ret ;
    };



}

let discountModel = new DiscountModel;
module.exports = discountModel;