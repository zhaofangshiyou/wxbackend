/*
 * create by zone on 2018/04/08
 * 油站的增删改查
 */
const router = require('koa-router')();
const config = require('../../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const MysqlModel = require('../../models/server.mysql.model')
const Station = MysqlModel.get('Station');
const Oil = MysqlModel.get('Oil');
const oilModel = require('../../models/oil_model');
const stationModel = require('../../models/station_model');
const Region = MysqlModel.get('Region')
const commonUtil = require('../utils/common');
const modelUtils = require('../../models/utils/common')
const request = require('request-promise-native');
const xlsx = require('xlsx');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

router.prefix(`/${config.VERSION}/backen/station`)

router.use(function (ctx, next) {
    ctx.set('Access-Control-Allow-Origin', '*');
    return next();
});

router.use(function (ctx, next) {
    return next().catch((err) => {
        if (401 == err.status) {
            ctx.status = 401;
            ctx.json = {status: 401, msg: "认证错误。"}
        } else {
            throw err;
        }
    });
});

//初始化页面、分页
router.get('/', async (ctx, next) => {
    try {
        let {act, province_id, id, page_num, num} = ctx.query;

        num = (num && (parseInt(num)>=0)) ? parseInt(num) : 15;  //默认15条
        page_num = (page_num && (parseInt(page_num)>=1)) ? (parseInt(page_num)-1) : 0;  //默认从第一条开始

        let options = {}
        if (province_id) {
            province_id = parseInt(province_id);
            options['province_id'] = province_id;
        }
        if (id) { //油站ID
            id = parseInt(id);
            options['id'] = id
        }
        /*
        let stations = await Station.findAll({
            attributes: [
                "id",
                "name",
                "province",
                "oil_gum_nums",
                "oil_list",
                "province_id",
                "city",
                ["(id+1000)","station_id"]
            ],
            where: options,
            order: Sequelize.literal("id ASC"),
            offset: (page_num * num),
            limit: num
        })
        */
        //修改了原本存储oil_list是"92号，98号"，现在是"1，2"
        let stations = await stationModel.queryStationList(province_id, id, page_num, num)

        let oilList = await oilModel.queryOilInfoByStationId();

        let allStations = await Station.findAll({
            attributes: ["id","name","province_id"]
        })

        let data = {}

        let regionInfo = await Region.findAll({
            attributes: ["id","name"],
            where: {type : "P"}
        })

        var stationList = [];
        for (let m = 0; m < stations.length; m++){
            let staOilList = [];
            let id = stations[m].id;

            for (let n = 0; n < oilList.length; n++){
                let staId = oilList[n].station_id;
                if (id == staId) {
                    staOilList.push(oilList[n]);
                }
            }

            stationList[m] = {};
            stationList[m] = stations[m];
            stationList[m].oil_id_list = staOilList;
        }

        var proList = [];
        for (let i = 0; i < regionInfo.length; i++) {
            let children = [];
            let proId = regionInfo[i].id;
            for (let j = 0; j < allStations.length; j++){
                let staProId = allStations[j].province_id;
                if (staProId == proId) {
                    children.push(allStations[j])
                }
            }
            proList[i] = {};
            proList[i].id = proId;
            proList[i].name = regionInfo[i].name;
            proList[i].stations = children;
        }

        let cnt = await stationModel.countStationByOptions(options)
        let cnt_str = JSON.stringify(cnt[0])
        station_num = JSON.parse(cnt_str).station_num

        data["province_list"] = proList;
        data["station_num"] = station_num;
        data["station_list"] = stationList;

        if (act && act == "export") {
            let filename = 'station_list_' + (new Date().toLocaleDateString());
            let headers = [];
            let data = [];
            let sts = await stationModel.queryStationList(province_id, id, page_num, 0)
            if (sts && sts.length >0) {
                for (let k in sts[0]) {
                   headers.push(k)    
                } 
                data = sts 
            }
     
            let buf = await modelUtils.toExcelBuf(headers, data)
            ctx.set('Content-disposition', 'attachment; filename=' + filename + '.xlsx');
            ctx.set('Content-type', 'application/xlsx');
            ctx.body = buf
        } else {
            ctx.body = {
                status: 0
                , msg: "success"
                , data: data
            }
        }
    } catch (error) {
        ctx.body = {
            status: 1
            , msg : "程序内部错误"
        }
    }
})


// 查找站点，可根据省份，也可全部
router.get('/site', async (ctx, next) => {
    try {

        let station_site = {}
        let {province_id} = ctx.query

        if (province_id) {
            station_site = await Station.findAll({
                where : {province_id : province_id}
            })
        } else {
            station_site = await Station.findAll()
        }

        ctx.body = {
            status: 0,
            msg: "success",
            data: {station_site:station_site}
        }
    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误"
        }
    }
})

router.get('/excel', async (ctx, next) => {
    try {
        let filename = 'station_list_' + (new Date().toLocaleDateString());
        let {province, name} = ctx.query
        console.log("==> get")
        let options = {}
        if (province) {
            options['province'] = province
        }
        if (name) {
            options['name'] = name
        }
        let stations = await Station.findAll({
            where: options,
            attributes: ['id', 'name', 'avatar_url', 'longitude', 'latitude', 'address', 'oil_gum_nums', 'province', 'city', 'created_at', 'updated_at', 'deleted_at']

        })
        let _headers = ['id', 'name', 'avatar_url', 'longitude', 'latitude', 'address', 'oil_gum_nums', 'province', 'city', 'created_at', 'updated_at', 'deleted_at'];
        let _data = stations;
        
        let buf = await modelUtils.toExcelBuf(_headers, _data)
        ctx.set('Content-disposition', 'attachment; filename=' + filename + '.xlsx');
        ctx.set('Content-type', 'application/xlsx');
        ctx.body = buf
    } catch (error) {
        ctx.body = {
            status: 1
            , msg : "程序内部错误"
        }
    }
})

// 新增参数限制
router.post('/', async (ctx, next) => {//新增油站
    try {

        console.log(ctx.request.body)
        console.log(ctx.query)
        let {name, oil_gum_nums, province, province_id, address, oil_list, avatar_url, city, type} = ctx.request.body;
        let params = {name,oil_gum_nums,province_id,province,address};

        type = (type && parseInt(type)) ? parseInt(type) : 1;

        if (commonUtil.reqParamsIsNull(params)) {
            ctx.body = {
                status : 4,
                msg : "传入参数错误."
            }
            return ;
        }

        //判断省份信息
        let province_info = await Region.findAll({
            where: {
                type: "P",
                id: province_id,
                name: province
            }
        })

        if ((!province_info) || (province_info.length == 0) || (province != province_info[0].name)) {
            ctx.body = {
                status: 2,
                msg: "传入的省份信息错误."
            }
            return;
        }

        //同一个省的油站名字不能重复
        let station_info = await Station.findAll({
            where: {
                province_id: province_id,
                name: name
            }
        })

        if (station_info && (station_info.length > 0 )) {
            ctx.body = {
                status : 5,
                msg : "该省该油站已经存在."
            }
            return;
        }

        //第三方接口找经纬度
        var options = {
            uri: 'http://restapi.amap.com/v3/geocode/geo',
            qs: {
                key: config.AMAP_ACCESS_KEY
                , address: address
            },

            json: true // Automatically parses the JSON string in the response
        };

        let amap_result = await request(options)
        if ((!amap_result) || (amap_result.geocodes.length == 0) || (!amap_result.geocodes[0].location)) {
            ctx.body = {
                status : 3,
                msg : "传入的详细地址信息错误."
            }
            return;
        }
        let location = amap_result.geocodes[0].location.split(',')

        let newStation = await Station.create({
            name: name  //油站名
            , avatar_url: avatar_url   //油站缩略图
            , longitude: location[0]   //经度
            , latitude: location[1]   //纬度
            , address: address   //详细地址
            , province_id: province_id //省份ID
            , oil_list: oil_list   //油品列表
            , oil_gum_nums: oil_gum_nums   //油枪号
            , province: province   //省份
            , city: city   //城市
            , type: type   //油站类型
        })

        ctx.body = {
            status: 0
            , msg: "success"
            , data: {
                station: newStation
            }
        }

    } catch (error) {
        ctx.body = {
            status: 1
            , msg : "程序内部错误"
        }
    }
})

//修改油站
router.put('/upd/:stationId', async (ctx, next) => {
    try{
        let station_id = ctx.params.stationId
        let {name, oil_gum_nums, province, province_id, address, oil_list, avatar_url, city, type} = ctx.request.body;
        let params = {station_id};

        console.log(ctx.request.body)

        if (commonUtil.reqParamsIsNull(params)) {
            ctx.body = {
                status : 4,
                msg : "传入参数错误."
            }
            return ;
        }

        let station_info = await Station.findAll({
            where: {
                id : station_id
            }
        })

        if ((!station_info) || (station_info.length != 1)) {
            ctx.body = {
                status : 6,
                msg : "该ID对应的油站不存在."
            }
            return;
        }

        //判断省份信息
        if (province_id && (province_id != station_info[0].province_id)) {
            /* 省份信息不能修改
            let province_info = await Region.findAll({
                where: {
                    type: "P",
                    id: province_id
                }
            })

            if ((!province_info) || (province_info.length == 0)) {
                ctx.body = {
                    status: 2,
                    msg: "传入的省份信息province_id错误."
                }
                return;
            }  */

            ctx.body = {
                status: 2,
                msg: "传入的省份信息province_id错误."
            }
            return;

        } else {
            province_id = station_info[0].province_id
        }

        //如果名字变更，同一个省的油站名字不能重复
        if (name && (name != station_info[0].name)) {
            let station_info = await Station.findAll({
                where: {
                    province_id: province_id,
                    name: name
                }
            })

            if (station_info && (station_info.length > 0)) {
                ctx.body = {
                    status: 5,
                    msg: "该省该油站已经存在."
                }
                return;
            }
        }

        //如果详细地址变更，第三方接口找经纬度
        if (address && (address != station_id[0].address)) {
            var options = {
                uri: 'http://restapi.amap.com/v3/geocode/geo',
                qs: {
                    key: config.AMAP_ACCESS_KEY
                    , address: address
                },

                json: true // Automatically parses the JSON string in the response
            };

            let amap_result = await request(options)
            if ((!amap_result) || (amap_result.geocodes.length == 0) || (!amap_result.geocodes[0].location)) {
                ctx.body = {
                    status: 3,
                    msg: "传入的详细地址信息错误."
                }
                return;
            }
            var location = amap_result.geocodes[0].location.split(',')
        }

        //确保传入参数不会影响数据库,省份不能被更改
        let datas = {};
        datas["name"] = "name";
        datas["oil_list"] = "oil_list";
        datas["avatar_url"] = "avatar_url";
        datas["address"] = "address";
        datas["oil_gum_nums"] = "oil_gum_nums";
        datas["province"] = "province";
        datas["province_id"] = "province_id";
        datas["city"] = "city";
        datas["type"] = "type";
        let upd_params = {};
        for (let k in datas) {
            let v = datas[k];
            upd_params[k] = ctx.request.body[v];
        }

        if (location) {
            upd_params["longitude"] = location[0];
            upd_params["latitude"] = location[1];
        }


        let newStation = await Station.update(
            upd_params,
            {
                where: {
                    id: station_id
                }
            })

        ctx.body = {
            status : 0,
            msg : "success"
        }

    } catch (error) {
        ctx.body = {
            status: 1
            , msg : "程序内部错误"
        }
    }

})

//删除站点
router.delete('/del', async (ctx, next) => {
    try {
        let {station_id} = ctx.request.body
        station_id = JSON.parse(station_id)

        //删除oil
        let ret1 = await oilModel.delOilByStation(station_id);

        //删除oil_gum
        let ret2 = await  oilModel.delOilGumByStation(station_id);

        //删除station
        let result = await Station.destroy({
            where: {
                id: {
                    [Op.in] : station_id
                }
            }
        })
        
        ctx.body = {
            status : 0,
            msg : "success"
        }

    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误"
        }

    }
})


module.exports = router