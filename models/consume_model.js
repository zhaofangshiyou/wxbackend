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
                "    concat(sta.id + 1000,LPAD(of.card_id,8,0)) as card_no," +
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
                " where sta.id = of.station_id " +
                "   and of.deleted_at is null ";
        //查找总数
        } else {
            sql = "SELECT sum(of.money) as money_total," +
                "         sum(of.vol) as vol_total," +
                "         sum((of.money - of.deduction_amount)) as actual_money_total" +
                "    FROM" +
                "       stations sta," +
                "       oil_flows of" +
                "   where sta.id = of.station_id ";
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
}

let consumeModel = new ConsumeModel();
module.exports = consumeModel;