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

class InvoiceModel {
    //查找发票记录，包含已注销卡号
    async queryInvoiceList(card_no,flag, page_num ,num){
        let sql = ""
         if (card_no && (card_no != "")) {
            sql = sql + " and  concat(c.card_prefix,LPAD(of.card_id,8,0)) = :card_no "
         }

         if (flag && (flag != "")) {
            sql = sql + " and of.is_invoicing = :flag "
         }

         let sql_main = " select sta_of.*,u.name as operator_name from "+
                    " ( select sta.name as station_name, " +
                    " concat(c.card_prefix,LPAD(of.card_id,8,0)) as card_no,"+
                    " of.cc_flow_id,"+
                    " date_format(of.created_at,'%Y-%m-%d %H:%i:%s') as consume_time," +
                    " of.oil_type as oil_name,"+
                    " of.vol,"+
                    " of.money,"+
                    " of.is_invoicing,"+
                    " (case of.is_invoicing when 1 then '未开' when 0 then '已开' else '未记录' end) as is_invoicing_name,"+
                    " date_format(of.updated_at,'%Y-%m-%d %H:%i:%s') as invoice_time, "+
                    " of.operator "+
                " from oil_flows of, stations sta, cards c "+
                " where of.station_id = sta.id and of.card_id = c.id " +  
                "   and of.deleted_at is null " + sql +
                " ) sta_of left join backend_users u on sta_of.operator = u.id " ;

        if ((page_num >=0) && (num >0)) {
            sql_main = sql_main + "  limit :page, :num"
        }

        let ret = await Conn.query(sql_main,{replacements: {card_no:card_no,flag:flag, page:(page_num*num), num:num},
            type: Sequelize.QueryTypes.SELECT})

        return ret;
    };

    async queryOilFlowsByCCFlowId(cc_flow_id){
        let ret = await OilFlow.findAll({
            where: {
                cc_flow_id : cc_flow_id
            },
            limit : 1 
        })
         
        return ret;
    };

    async addInvoice(cc_flow_id,operator,flag){
        let ret = await OilFlow.update({
                is_invoicing : flag,
                operator : operator
            },
            {where :{
                cc_flow_id : cc_flow_id
                }
            }
        )
    };

}

let invoiceModel = new InvoiceModel;
module.exports = invoiceModel;