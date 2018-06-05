/**
 * Created by miah on 2018/5/7.
 * 用户数据操作类
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

class BackendUserModel {
    //根据ID查找后台用户
    async queryUserById(id){
        let ret = await BackendUser.findAll({
            where :{
                id : id
            },
            limit : 1
        })

        return ret;
    };
    //用户管理列表
    async queryUserCardList(card_no,page_num,num){
        let sql = ""
     
        if (card_no && (card_no != "")){
            sql = sql + " and (CONCAT(c.card_prefix, LPAD(c.id, 8, 0)) = :card_no) "
        }

        let sql_main = "SELECT  a.*, c.name AS initiate_by_name, b.initiate_by, "+
	                   "        d.name AS confirm_by_name, b.confirm_by "+
                        " FROM (SELECT  c.id, "+
                        "      CONCAT(c.card_prefix, LPAD(c.id, 8, 0)) AS card_no," +
				        "      u.name, u.id_card, c.unit_card_type, "+
                        "   (CASE c.unit_card_type  WHEN 0 THEN '个人卡' WHEN 1 THEN '单位卡'"+
                        "       ELSE '未定义类型' END) AS type, "+
				        "       c.refund_status,"+
                        "   (CASE WHEN (c.refund_status = '0' "+
                        "               AND c.person_balance = 0 "+
                        "               AND c.company_balance = 0) THEN '已退款' "+
                        "         WHEN (c.refund_status = '0' "+
                        "               AND (c.person_balance <> 0 "+
                        "               OR c.company_balance <> 0)) THEN '未退款' "+
                        "         WHEN c.refund_status = '1' THEN '退款申请中' "+
                        "         ELSE '未定义状态' END) AS refund, "+
				        "    c.person_balance + c.company_balance AS deposit_money,"+
				        "    c.status,DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i:%s') AS created_time,"+
                        "    (CASE c.status WHEN '1' THEN '销户' WHEN '0' THEN '正常' "+
                        "       ELSE '未定义状态' END) AS card_status, "+
                        "    (CASE status WHEN '1' THEN DATE_FORMAT(c.updated_at, '%Y-%m-%d %H:%i:%s') "+
                        "    ELSE '-' END) AS closed_time,"+
                        "    DATE_FORMAT(c.updated_at, '%Y-%m-%d %H:%i:%s') AS operated_time "+
                        "FROM cards c, users u WHERE u.id = c.user_id " +
                        " and u.deleted_at is null and c.deleted_at is null" + sql + ") a " +
                    " LEFT JOIN "+
                        "    refunds b ON a.id = b.card_id "+
                    " LEFT JOIN "   +  
                        "    backend_users c ON b.initiate_by = c.id "+
                    " LEFT JOIN "+
                        "    backend_users d ON b.confirm_by = d.id "+
                    " order by operated_time desc" ;
        if((page_num>=0) && (num>0)) {
            sql_main = sql_main + " limit :page, :num";
        }
   
        let ret = await Conn.query(sql_main,{replacements:{card_no:card_no, page:page_num*num,
                num:num},type: Sequelize.QueryTypes.SELECT});

        return ret ;
    };
    //根据ID查找卡号
    async queryCardById(id){
        let ret = await Card.findAll({
            where : { id:id},
            limit : 1
        })

        return ret ;
    };
    //根据ID查找副卡信息
    async querySubCardById(id){
        let ret = await Card.findAll({
            where : { parent_id:id}
        })

        return ret ;
    }
    //注销卡号
    async delCards(id){
        let ret = await Card.destroy({
            where :{
                id : {[Op.in]:id}
            }
        })

        return ret ;
    };
    //申请退款
    async refundApply(ids,options){
        let ret = await Card.update(
           {refund_status : 1} ,
           {where : {
               id :{
                   [Op.in] : ids}
                }
            }
        )

        let ret1 = await Refund.bulkCreate(options)
        return ret1
    };
    //确认退款
    async refundConfirm(ids,confirm_by){
        let ret = await Card.update(
            {refund_status : 0,
             person_balance : 0,
             company_balance : 0} ,
            {where : {
                id :{
                    [Op.in] : ids}
                 }
            }
        )

        let ret1 = await Refund.update(
            {confirm_by: confirm_by,
                status : 2},
            {where : {
                card_id : {
                    [Op.in]:ids},
                status : 1
                }
            }
        )
        return ret1;
    };
}

let backendUserModel = new BackendUserModel;
module.exports = backendUserModel;