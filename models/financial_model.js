/**
 * Created by miah on 2018/5/7.
 * 消费数据操作类
 */

const MysqlModel = require('./server.mysql.model')
const Station = MysqlModel.get('Station');
const OilInfo = MysqlModel.get('OilInfo');
const OilGum = MysqlModel.get('OilGum');
const Region = MysqlModel.get('Region');
const Oil = MysqlModel.get('Oil');
const OilFlow = MysqlModel.get('OilFlow');
const Card = MysqlModel.get('Card');
const User = MysqlModel.get('User');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Conn = require('../db/mysql_connection')

class ConsumeModel {
    //查询消费明细
    async queryConsumeDetailList(options, type){
        let province_id = options.province_id
        let station_id = options.station_id
        let begin_time = options.begin_time
        let end_time = options.end_time
        let oil_id = parseInt(options.oil_id)
        let vol_min = parseFloat(options.vol_min)
        let vol_max = parseFloat(options.vol_max)
        let pay_channel = options.pay_channel
        let page_num = parseInt(options.page_num)
        let num = parseInt(options.num)
        let sql = ""

        // 查找明细列表
        if (type == 1) {
            sql = "SELECT " +
                "    sta.province as province_name," +
                "    sta.name as station_name," +
                "    concat(c.card_prefix,LPAD(of.card_id,8,0)) as card_no," +
                "    of.created_at as consume_time," +
                "    of.oil_gum_num as gum_num," +
                "    of.oil_type as oil_name, " +
                "    of.vol ," +
                "    of.money , " +
                "    of.poundage," +
                "    of.deduction_amount as discount," +
                "    of.pay_channel as pay_type," +
                "    (case of.pay_channel when 1 then '个人卡' " +
                "                         when 2 then '单位卡' " +
                "                         when 3 then '微信支付' " +
                "                         else '未定义' end) as pay_channel, " +
                "    (of.money - of.deduction_amount) as actual_money" +
                "  FROM" +
                "    stations sta," +
                "    oil_flows of" +
                "    cards c"
                " where sta.id = of.station_id " +
                "   and c.id = of.card_id "+
                "   and of.deleted_at is null ";
        //查找总数
        } else {
            sql = "SELECT sum(of.money) as money_total," +
                "         sum(of.vol) as vol_total," +
                "         sum((of.money - of.deduction_amount)) as actual_money_total" +
                "    FROM" +
                "       stations sta," +
                "       oil_flows of" +
                "   where sta.id = of.station_id " +
                "      and of.deleted_at is null ";
        }

        if (province_id && (province_id != "")) {
            sql = sql + " and sta.province_id = :province_id ";
        }

        if (station_id && (station_id != "")) {
            sql = sql + " and of.station_id = :station_id ";
        }

        if (begin_time && (begin_time != "")) {
            sql = sql + " and of.created_at >= :begin_time ";
        }

        if (end_time && (end_time != "")) {
            sql = sql + " and of.created_at <= :end_time ";
        }

        if (oil_id && (oil_id != "")) {
            sql = sql + " and of.oil_id = :oil_id ";
        }

        if (vol_min && (vol_min != "")) {
            sql = sql + " and of.vol >= :vol_min ";
        }

        if (vol_max && (vol_max != "")) {
            sql = sql + " and of.vol <= :vol_max ";
        }

        if (pay_channel && (pay_channel != "")) {
            sql = sql + " and of.pay_channel = :pay_channel ";
        }

        if (type ==1) {
            sql = sql + "order by of.created_at desc ,of.oil_gum_num asc"
        }

        if ((page_num >= 0) && (num > 0)) {
            sql = sql + " limit :page, :num "
        }

        let ret = await Conn.query(sql,{replacements: {province_id:province_id, station_id:station_id,
                        begin_time:begin_time, end_time:end_time, oil_id:oil_id, vol_min:vol_min,
                        vol_max:vol_max, pay_channel:pay_channel, page:(page_num*num), num:num},
            type: Sequelize.QueryTypes.SELECT})

        return ret;
    };

    //查找消费汇总
    async queryConsumeList(options, type){
        let province_id = options.province_id
        let station_id = options.station_id
        let begin_time = options.begin_time
        let end_time = options.end_time
        let oil_id = parseInt(options.oil_id)
        let page_num = parseInt(options.page_num)
        let num = parseInt(options.num)
        let sql = ""

        // 查找不带油品列表
        if (type == 1) {
            sql = "SELECT  " +
                " sta.province as province_name, " +
                "    sta.name as station_name, " +
                "    sum(of.vol) as vol , " +
                "    sum(of.money) as money, " +
                "    sum((of.money-of.deduction_amount)) as actual_money, " +
                "    now() as currrent_time " +
                "  FROM " +
                "    stations sta, " +
                "    oil_flows of " +
                "where sta.id = of.station_id " +
                "  and of.deleted_at is null ";
        //查找带油品的
        } else if (type == 2) {
            sql = "SELECT " +
                " sta.province as province_name," +
                "    sta.name as station_name," +
                "    of.oil_type  as oil_name," +
                "    sum(of.vol) as vol ," +
                "    sum(of.money) as money," +
                "    sum((of.money-of.deduction_amount)) as actual_money," +
                "    now() as currrent_time " +
                " FROM" +
                "    stations sta," +
                "    oil_flows of " +
                " where sta.id = of.station_id " +
                "   and of.deleted_at is null ";
        //查找总数
        } else {
            sql = "SELECT " +
                "    sum(of.vol)  as vol_total, " +
                "    sum(of.money) as money_total, " +
                "    sum((of.money-of.deduction_amount)) as actual_money_total " +
                "  FROM" +
                "    stations sta," +
                "    oil_flows of " +
                " where sta.id = of.station_id " +
                "   and of.deleted_at is null ";
        }

        if (province_id && (province_id != "")) {
            sql = sql + " and sta.province_id = :province_id ";
        }

        if (station_id && (station_id != "")) {
            sql = sql + " and of.station_id = :station_id ";
        }

        if (begin_time && (begin_time != "")) {
            sql = sql + " and of.created_at >= :begin_time ";
        }

        if (end_time && (end_time != "")) {
            sql = sql + " and of.created_at <= :end_time ";
        }

        if (oil_id && (oil_id != "")) {
            sql = sql + " and of.oil_id = :oil_id ";
        }

        if (type ==1) {
            sql = sql + " group by sta.province,sta.name, now() order by sta.province,sta.name asc"
        } else if (type == 2) {
            sql = sql +  " group by sta.province,sta.name, now(),of.oil_type order by sta.province,sta.name asc"
        }

        if ((page_num >= 0) && (num > 0)) {
            sql = sql + " limit :page, :num "
        }

        let ret = await Conn.query(sql,{replacements: {province_id:province_id, station_id:station_id,
                begin_time:begin_time, end_time:end_time, oil_id:oil_id, page:(page_num*num), num:num},
            type: Sequelize.QueryTypes.SELECT})

        return ret;
    };

    //查找充值明细
    async queryRechargeDetailList(options, type){
        let province_id = options.province_id
        let station_id = options.station_id
        let begin_time = options.begin_time
        let end_time = options.end_time
        let card_id = options.card_id
        let page_num = parseInt(options.page_num)
        let num = parseInt(options.num)
        let sql = ""

        // 查找明细列表
        if (type == 1) {
        sql = "select sta.province as province_name, " +
            "         sta.name as station_name," +
            "          concat(sta.id + 1000,LPAD(cf.card_id,8,0)) as card_no," +
            "          cf.money," +
            "          cf.poundage," +
            "          cf.created_at as charge_time " +
            "  from stations sta, charge_flows cf ,cards c " +
            "  where sta.id = c.station_id " +
            "      and cf.card_id = c.id" +
            "      and c.deleted_at is null "+
            "      and sta.deleted_at is null "+
            "      and cf.deleted_at is null ";
        //查找总数
        } else {
            sql = " select sum(cf.money) as money_total, " +
                " sum(cf.poundage) as poundage_total " +
                "  from stations sta, charge_flows cf ,cards c " +
                "  where sta.id = c.station_id " +
                "      and cf.card_id = c.id " +
                "      and c.deleted_at is null "+
                "      and sta.deleted_at is null "+
                "      and cf.deleted_at is null ";
        }

        if (province_id && (province_id != "")) {
            sql = sql + " and sta.province_id = :province_id ";
        }

        if (station_id && (station_id != "")) {
            sql = sql + " and sta.id = :station_id ";
        }

        if (begin_time && (begin_time != "")) {
            sql = sql + " and cf.created_at >= :begin_time ";
        }

        if (end_time && (end_time != "")) {
            sql = sql + " and cf.created_at <= :end_time ";
        }

        if (card_id && (card_id != "")) {
            sql = sql + " and c.id = :card_id ";
        }

        if (type ==1) {
            sql = sql + "order by cf.created_at desc"
        }

        if ((page_num >= 0) && (num > 0)) {
            sql = sql + " limit :page, :num "
        }

        let ret = await Conn.query(sql,{replacements: {province_id:province_id, station_id:station_id,
                begin_time:begin_time, end_time:end_time, card_id:card_id, page:(page_num*num), num:num},
            type: Sequelize.QueryTypes.SELECT})

        return ret;
    };

    //充值汇总
    /*
    async queryRechargeList(options, type){
        let province_id = options.province_id
        let station_id = options.station_id
        let page_num = parseInt(options.page_num)
        let num = parseInt(options.num)
        let sql = ""
        let sql_main = ""

        if (province_id && (province_id != "")) {
            sql = sql + " and sta.province_id = :province_id ";
        }

        if (station_id && (station_id != "")) {
            sql = sql + " and sta.id = :station_id ";
        }

        // 查找列表
        if (type == 1) {
            sql_main = "select charge.province_name,charge.station_name,charge.money,charge.poundage," +
                "      charge.money-consume.actual_money as deposit_money from " ;
            //查找总数
        } else {
            sql_main = "select sum(charge.money) as money_total, sum(charge.poundage) as pondage_total, " +
                "   sum(charge.money-consume.actual_money) as deposit_money_total from ";
        }

        let sql_base = "(select sta.province as province_name," +
            "  sta.name as station_name," +
            "          sta.id," +
            "          sum(cf.money) as money," +
            "          sum(cf.poundage) as poundage " +
            "  from stations sta, charge_flows cf ,cards c  " +
            "  where sta.id = c.station_id  " +
            "      and cf.card_id = c.id  " +
            "      and c.id = cf.card_id  " +
            "      and cf.deleted_at is null  " + sql +
            "      group by sta.province,sta.name,sta.id  order by sta.province desc) charge ,  " +
            
            " (select sta.id,  " +
            " sta.province as province_name,  " +
            "    sta.name as station_name,  " +
            "    sum((of.money-of.deduction_amount)) as actual_money  " +
            "from stations sta, oil_flows of  " +
            "where sta.id = of.station_id  " +
            "   and  of.deleted_at is null  " + sql +
            "group by sta.province,sta.name,sta.id order by sta.province desc ) consume  " +
            "where charge.id = consume.id ";
            

        sql_main = sql_main + sql_base

        if (type ==1) {
            sql_main = sql_main + " order by charge.province_name desc"
        }

        if ((page_num >= 0) && (num > 0)) {
            sql_main = sql_main + " limit :page, :num "
        }

        let ret = await Conn.query(sql_main,{replacements: {province_id:province_id, station_id:station_id,
             page:(page_num*num), num:num}, type: Sequelize.QueryTypes.SELECT})

        return ret;
    };*/
    async queryRechargeList(options, type){
        let province_id = options.province_id
        let station_id = options.station_id
        let page_num = parseInt(options.page_num)
        let num = parseInt(options.num)
        let sql = ""
        let sql_main = ""

        if (province_id && (province_id != "")) {
            sql = sql + " and sta.province_id = :province_id ";
        }

        if (station_id && (station_id != "")) {
            sql = sql + " and sta.id = :station_id ";
        }

        // 查找列表
        if (type == 1) {
            sql_main = "select charge.province_name ,charge.station_name, " +
                " charge.money ,charge.poundage ," +
                "  c.deposit as deposit_money from " ;
            //查找总数
        } else {
            sql_main = "select sum(charge.money) as money_total, sum(charge.poundage) as pondage_total, " +
                "   sum(c.deposit) as deposit_money_total from ";
        }

        let sql_base = "( select sta.province as province_name ,sta.name as station_name, " +
            " sum(cf.money) as money ,sum(cf.poundage) as poundage ,sta.id " +
            " from stations sta, charge_flows cf ,cards c  " +
            "  where sta.id = c.station_id  " +
            "      and cf.card_id = c.id  " +
            "      and c.id = cf.card_id  " +
            "      and c.deleted_at is null "+
            "      and sta.deleted_at is null "+
            "      and cf.deleted_at is null  " + sql +
            " group by sta.province,sta.name,sta.id ) charge " + 
            " left join " + 
            " (select station_id, sum(company_balance + person_balance) as deposit " +
            "    from cards where deleted_at is null group by station_id) c "+
            "  on c.station_id = charge.id "    

        sql_main = sql_main + sql_base

        if (type ==1) {
            sql_main = sql_main + " order by charge.province_name desc"
        }

        if ((page_num >= 0) && (num > 0)) {
            sql_main = sql_main + " limit :page, :num "
        }

        let ret = await Conn.query(sql_main,{replacements: {province_id:province_id, station_id:station_id,
             page:(page_num*num), num:num}, type: Sequelize.QueryTypes.SELECT})

        return ret;
    };

    //往来账
    async queryAccountList(options){
        let begin_time = options.begin_time
        let end_time = options.end_time
        let oil_id = parseInt(options.oil_id)
        let sql_param = ""    
        if (begin_time && (begin_time != "")){
            sql_param = sql_param + " and of.created_at >= :begin_time";
        }

        if (end_time && (end_time != "")){
            sql_param = sql_param + " and of.created_at <= :end_time";
        }

        if (oil_id && (oil_id != "")){
            sql_param = sql_param + " and of.oil_id = :oil_id";
        }
       
        let sql = "select of_sta.sta_id, of_sta.sta_name, sum(of_sta.actual_money) as actual_money,"+
            "   c_sta.station_id,c_sta.station_name "+
            " from (select  sta.id as sta_id,sta.name as sta_name, of.card_id,"+
            "       sum((of.money-of.deduction_amount)) as actual_money "+
            "        from  stations sta,  oil_flows of "+
            "    where sta.id = of.station_id  "+
            "      and sta.deleted_at is null " +
            "      and of.deleted_at is null " + sql_param +
            "    group by sta.name,sta.id  ,of.card_id "+
            "        order by sta.id desc ) of_sta "+
            " left join "+
            "        (select sta.id as station_id, sta.name as station_name,c.id "+
            "        from stations sta, cards c "+
            "        where sta.id = c.station_id "+
            "           and sta.deleted_at is null " +
            "           and c.deleted_at is null " +
            "        order by sta.id desc ) c_sta "+
            "        on (c_sta.id = of_sta.card_id ) "+
            "        where of_sta.sta_id <> c_sta.station_id "+
            " group by of_sta.sta_id, of_sta.sta_name,c_sta.station_id,c_sta.station_name";

        let ret = await Conn.query(sql,{replacements: {begin_time:begin_time, end_time:end_time,
                oil_id:oil_id}, type: Sequelize.QueryTypes.SELECT});
   
        return ret;
    }
}

let consumeModel = new ConsumeModel();
module.exports = consumeModel;