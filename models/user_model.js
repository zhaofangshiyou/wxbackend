/**
 * Created by miah on 2018/5/7.
 * 用户数据操作类
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
const BackendUser = MysqlModel.get('BackendUser');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Conn = require('../db/mysql_connection')

class UserModel {
    async queryUserById(id){
        let ret = await BackendUser.findAll({
            where :{
                id : id
            },
            limit : 1
        })

        return ret;
    };

/*SELECT  a.*,
		c.name AS initiate_by_name,
		b.initiate_by,
		d.name AS confirm_by_name,
		b.confirm_by
  FROM (SELECT  c.id,
				CONCAT(card_prefix, LPAD(c.id, 8, 0)) AS card_no,
				u.name,
				u.id_card,
				c.unit_card_type,
				(CASE c.unit_card_type
					WHEN 1 THEN '个人卡'
					WHEN 2 THEN '单位卡'
					WHEN 3 THEN '副卡'
					ELSE '未定义类型' END) AS type,
				c.refund_status,
				(CASE
					WHEN (c.refund_status = '0'
						 AND c.person_balance = 0
						 AND c.company_balance = 0)
						THEN '已退款'
					WHEN (c.refund_status = '0'
						 AND (c.person_balance <> 0
						  OR c.company_balance <> 0))
						THEN '未退款'
					WHEN c.refund_status = '1' THEN '退款申请中'
					ELSE '未定义状态' END) AS refund,
				c.person_balance + c.company_balance AS deposit_money,
				c.status,
				(CASE c.status
					WHEN '1' THEN '销户'
					WHEN '0' THEN '正常'
					ELSE '未定义状态' END) AS card_status,
				DATE_FORMAT(c.created_at, '%Y-%m-%d %H:%i:%s') AS created_time,
				(CASE status
					WHEN '1' THEN c.updated_at
					ELSE '-' END) AS closed_time,
				c.updated_at AS operated_time
		 FROM cards c, users u
		WHERE u.id = c.user_id) a
	LEFT JOIN
		refunds b ON a.id = b.card_id
	LEFT JOIN
		backend_users c ON b.initiate_by = c.id
	LEFT JOIN
		backend_users d ON b.confirm_by = d.id
order by operated_time desc
  
 */
}

let userModel = new UserModel;
module.exports = userModel;