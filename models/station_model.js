/**
 * Created by miah on 2018/5/7.
 * station数据操作类
 */

const MysqlModel = require('./server.mysql.model')
const Station = MysqlModel.get('Station');
const OilInfo = MysqlModel.get('OilInfo');
const OilGum = MysqlModel.get('OilGum');
const Oil = MysqlModel.get('Oil');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Conn = require('../db/mysql_connection')

class StationModel {
    //查找油站列表
    async queryAllStationInfo(){

        let ret = await Station.findAll({
            attributes: {exclude : ["create_at,update_at,delete_at"]}
        });

        return ret;
    };

    //根据ID查找油站
    async queryStationById(id){

        let ret = await Station.findAll({
            attributes: {exclude : ["create_at,update_at,delete_at"]},
            where : {
                id : id
            },
            limit : 1
        });

        return ret;
    };

    //查询条件为province_id、id
    async countStationByOptions(options){

        let ret = await Station.findAll({
            attributes : [[Sequelize.fn("count",Sequelize.col("id")), "station_num"]],
            where : options
        })

        return ret;
    };

    //查找油站列表，不会用sequelize
    async queryStationList(province_id,station_id, page_num, num){

        let sql = " select sta.id, sta.name, sta.province, sta.oil_gum_nums, sta.province_id, sta.city,sta.type, " +
            " (case sta.type when 1 then '自有' when 2 then '共享' end) as station_type,sta.address,"+
            " 1000+sta.id as station_id, group_concat(oi.name separator '、') as oil_list" +
            " from  stations sta  left join oil_infos oi " +
            " on find_in_set(oi.id, sta.oil_list) " +
            "  where oi.deleted_at is null" +
            "   and sta.deleted_at is null ";
        if (station_id && station_id > 0) {
            sql = sql + " and sta.id = :id "
        }

        if (province_id && province_id > 0) {
            sql = sql + " and sta.province_id = :province"
        }

        sql = sql + " group by sta.id ";
        if ((page_num >= 0) && (num > 0)) {
            sql = sql + " limit :page, :num "
        }

        let ret = await Conn.query(sql,{replacements: {id:station_id, province:province_id, page:(page_num*num), num:num},
            type: Sequelize.QueryTypes.SELECT})

        return ret;
    };

}

let stationModel = new StationModel();
module.exports = stationModel