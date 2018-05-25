/**
 * Created by miah on 2018/5/7.
 * oil数据操作类
 */

const MysqlModel = require('./server.mysql.model')
const Station = MysqlModel.get('Station');
const OilInfo = MysqlModel.get('OilInfo');
const OilGum = MysqlModel.get('OilGum');
const Region = MysqlModel.get('Region');
const Oil = MysqlModel.get('Oil');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Conn = require('../db/mysql_connection')

class OilModel {
    //查找油品列表
    async queryAllOilInfo(){
        let ret = await OilInfo.findAll({
            attributes: ["id","name"],
            order : [['id','ASC']]
        });

        return ret;
    };

    //绑定油枪油品关系
    async addOilGums(oil_id,gum_num,station_id){
        let ret = await OilGum.create({
            oil_id : oil_id,
            gum_num : gum_num,
            station_id : station_id
        });

        return ret;
    };

    //修改油枪与油品关系
    async updOilGums(id,upd_params){
        let ret = await OilGum.update(
            upd_params,
            {
                where: {
                    id: id
                }
            }
        );

        return ret;
    };

    //删除油枪与油品绑定关系
    async delOilGums(id){
        let ret = await OilGum.destroy(
            {
                where: {
                    id:{
                        [Op.in]:id
                    }
                }
            }
        );

        return ret;
    };

    //查询某个油站某号油枪是否已经存在绑定关系
    async queryOilGumByStationGum(station_id,gum_num){
        let ret = await OilGum.findAll({
            where : {
                station_id : station_id,
                gum_num : gum_num
            }
        })

        return ret;
    };

    //根据id查找油品
    async queryOilById(id){
        let ret = await OilInfo.findAll({
            where :{
                id : id
            },
            limit : 1
        })

        return ret;
    };

    //根据id查找油品油枪对应关系
    async queryOilGumById(id){
        let ret = await OilGum.findAll({
            where :{
                id : id
            }
        })

        return ret;
    };

    //删除oil_gum,当删除station时
    async delOilGumByStation(station_id){
        let ret = await OilGum.destroy({
            where : {
                station_id : {
                    [Op.in] : station_id
                }
            }
        })

        return ret;
    };

    //删除station时，删除oil
    async delOilByStation(station_id){
        let ret = await Oil.destroy({
            where : {
                station_id : {
                    [Op.in] : station_id
                }
            }
        })

        return ret;
    };

    //查找油品油枪列表，不会用sequelize
    async queryOilGumList(station_id, page_num, num){
        let sql = " select og.id, og.oil_id, oi.name as oil_name, og.station_id," +
            " sta.name as station_name, og.gum_num " +
            " from oil_infos oi, oil_gums og, stations sta " +
            " where oi.id = og.oil_id " +
            "   and sta.id = og.station_id " +
            "   and oi.deleted_at is null" +
            "   and og.deleted_at is null" +
            "   and sta.deleted_at is null ";
        if (station_id && station_id > 0) {
            sql = sql + " and sta.id = :id "
        }

        if ((page_num >= 0) && (num > 0)) {
            sql = sql + " limit :page, :num "
        }

        let ret = await Conn.query(sql,{replacements: {id:station_id, page:(page_num*num), num:num},
                                        type: Sequelize.QueryTypes.SELECT})

        return ret;
    };

    //根据油站id查找油枪使用
    async queryOilGumByStation(station_id){
        let ret = await OilGum.findAll({
            attributes:["id","oil_id","station_id","gum_num"],
            where : {station_id : station_id}
        })

        return ret;
    };

    //根据油站ID查找油品信息
    async queryOilInfoByStationId(station_id){
        let sql = " select oi.id as oil_id ,oi.name as oil_name, sta.id as station_id " +
            "  from oil_infos oi, stations sta " +
            " where find_in_set(oi.id,sta.oil_list) " +
            "   and oi.deleted_at is null" +
            "   and sta.deleted_at is null " ;

        if (station_id && station_id > 0) {
            sql = sql + "   and sta.id = :id";
        }

        let ret = await Conn.query(sql,{replacements: {id:station_id},
            type: Sequelize.QueryTypes.SELECT})

        return ret;
    };

    //新增油价
    async addOilPrice(insert_params){
        let ret = await Oil.bulkCreate(
            insert_params
        )

        return ret
    };

    //根据省份和油品ID确定油价
    async queryOilPriceByProOil(province_id,oil_id){
        let ret = await Oil.findAll({
            where : {
                province_id: province_id,
                oil_id : oil_id,
            //    create_at : time
            },
            limit : 1
        })

        return ret;
    };

    //删除油价
    async delOilPriceByProvince(province_id){
        let ret = await Oil.destroy({
            where : {
                province_id : {
                    [Op.in]: province_id
                }
            }
        })

        return ret;
    }

    //根据省份ID查询油价
    async queryOilPriceByProId(province_id){
        let ret = await Oil.findAll({
            where : {
                province_id : province_id
            }
        })

        return ret;
    };

    //查询所有油价
    async queryAllOilPrice(){
        let ret = await Oil.findAll()
        return ret;
    };

    //查询油价列表
    async queryOilPriceList(options,page_num,num){
        //options.type = "P"
        let ret = []
        if ((page_num>=0) && (num>0)) {
            ret = await Region.findAll({
                attributes: ["id", "name", "type"],
                include: [{
                    model: Oil,
                    attributes: ["oil_id", ["name", "oil_name"], "price", "active_at"],
                    where: options
                }],
                where: {type : "P"},
                order : [['id','ASC'],[Oil,'id','ASC']],
                offset: (page_num * num),
                limit: num
            })
        } else {
            ret = ret = await Region.findAll({
                attributes: ["id", "name", "type"],
                include: [{
                    model: Oil,
                    attributes: ["oil_id", ["name", "oil_name"], "price", "active_at"],
                    where: options,
                }],
                where: {type : "P"},
                order : [['id','ASC'],[Oil,'id','ASC']]
            })
        }

        return ret;
    };

}

let oilModel = new OilModel();
module.exports = oilModel;