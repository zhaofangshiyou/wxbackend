/*
 * create by miah on 2018/04/08
 * 油品的增删改查
 */
const router = require('koa-router')();
const config = require('../../config/config')
const jwt = require('jsonwebtoken');
const koa_jwt = require('koa-jwt');
const oilModel = require('../../models/oil_model');
const stationModel = require('../../models/station_model');
const commonUtil = require('../utils/common');

router.prefix(`/${config.VERSION}/backen/oil`)

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

//查找所有油品信息
router.get('/', async (ctx, next) => {
    try {
        let oilInfo = await oilModel.queryAllOilInfo();

        if (!oilInfo) {
            ctx.body = {
                status: 2,
                msg: "查询信息失败."
            }
            return;
        }

        ctx.body = {
            status: 0,
            msg: "success",
            data: oilInfo
        }
    }catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误"
        }
    }
})

//新增油枪油品绑定关系
router.post('/gum/add', async (ctx, next) => {
    try {
        let {station_id, gum_num, oil_id} = ctx.request.body;
        let params = {station_id, gum_num, oil_id};

        if (commonUtil.reqParamsIsNull(params)) {
            ctx.body = {
                status : 2,
                msg : "传入参数错误."
            }
            return;
        }

        oil_id = parseInt(oil_id);
        gum_num = parseInt(gum_num);
        station_id = parseInt(station_id);

        let oilInfo = await oilModel.queryOilById(oil_id);
        if ((!oilInfo) || (oilInfo.length != 1)) {
            ctx.body = {
                status : 4,
                msg : "油品ID "+oil_id+" 对应油品不存在."
            }
            return;
        }

        let stationInfo = await stationModel.queryStationById(station_id);
        if ((!stationInfo) || (stationInfo.length !=1)) {
            ctx.body = {
                status : 5,
                msg : "油站ID "+station_id+" 对应油站不存在"
            }
            return;
        }

        if (gum_num > parseInt(stationInfo[0].oil_gum_nums)) {
            ctx.body = {
                status : 6,
                msg : "油枪数量超过油站油枪预设数量."
            }
            return;
        }

        let oilGums = await oilModel.queryOilGumByStationGum(station_id,gum_num);
        if (oilGums && (oilGums.length > 0)){
            ctx.body = {
                status : 7,
                msg : "该油站的这个油枪已经被使用."
            }
        }

        let newOilGums = await oilModel.addOilGums(oil_id,gum_num,station_id)

        if (!newOilGums) {
            ctx.body = {
                status: 3,
                msg: "新增数据失败."
            }
            return;
        }

        ctx.body = {
            status: 0,
            msg: "success",
            data: newOilGums
        }
    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误"
        }
    }
})

//修改油枪油品关系
router.put('/gum/upd/:id', async (ctx, next) => {
    try {
        let id = ctx.params.id
        let {station_id, gum_num, oil_id} = ctx.request.body;
        let params = {id};

        if (commonUtil.reqParamsIsNull(params)) {
            ctx.body = {
                status : 2,
                msg : "传入参数错误."
            }
            return;
        }

        id = parseInt(id)
        let oilGum = await oilModel.queryOilGumById(id)
        if ((!oilGum) || (oilGum.length != 1)) {
            ctx.body = {
                status : 3,
                msg : "传入的油品油枪记录id "+id+" 没有对应的记录."
            }
            return;
        }

        if (station_id && parseInt(station_id) != oilGum[0].station_id) {
            ctx.body = {
                status : 4,
                msg : "油站id与原油站id数据不一致."
            }
            return;
        } else {
            station_id = oilGum[0].station_id
        }

        //防止数据未被更新
        let stationInfo = await stationModel.queryStationById(station_id);
        if ((!stationInfo) || (stationInfo.length !=1)) {
            ctx.body = {
                status : 5,
                msg : "油站ID "+station_id+" 对应油站不存在"
            }
            return;
        }

        if (gum_num && (gum_num > parseInt(stationInfo[0].oil_gum_nums))) {
            ctx.body = {
                status : 6,
                msg : "油枪数量超过油站油枪预设数量."
            }
            return;
        }

        if (oil_id) {
            oil_id = parseInt(oil_id)
            let oilInfo = await oilModel.queryOilById(oil_id);
            if ((!oilInfo) || (oilInfo.length != 1)) {
                ctx.body = {
                    status : 7,
                    msg : "油品ID "+oil_id+" 对应油品不存在."
                }
                return;
            }
        }


        let datas = {};
        datas["station_id"] = "station_id";
        datas["gum_num"] = "gum_num";
        datas["oil_id"] = "oil_id";
        let upd_params = {};
        for (let k in datas) {
            let v = datas[k];
            upd_params[k] = ctx.request.body[v];
        }

        let ret = await oilModel.updOilGums(id,upd_params);
        if (ret && (ret.length!=0)) {
            ctx.body = {
                status : 0,
                msg : "success",
                data : ret
            }
            return ;
        }

        ctx.body = {
            status : 7,
            msg : "更新失败."
        }


    } catch(error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误"
        }
    }
})

//删除油枪油品关系
router.delete('/gum/del', async (ctx, next) => {
    try {
        let {id} = ctx.request.body;
        id = JSON.parse(id);

        let ret = oilModel.delOilGums(id);
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

//初始化页面和分页
router.get('/gum', async (ctx, next) => {
    try {
        let {page_num, num, station_id} = ctx.query;

        num = (num && (parseInt(num)>=0)) ? parseInt(num) : 15;  //默认15条
        page_num = (page_num || (parseInt(page_num)>=0)) ? (parseInt(page_num)-1) : 0;  //默认从第一条开始

        if (station_id) {
            station_id = parseInt(station_id);
        }

        //let stationList = await stationModel.queryAllStationInfo()

        let oilList = await oilModel.queryOilGumList(station_id,page_num,num);

        let oilNum = await oilModel.queryOilGumList(station_id,0,0)

        if (oilList) {
            ctx.body = {
                status : 0,
                msg : "success",
                data : {
                    oil_gum_list : oilList,
                    //station_list : stationList,
                    oil_gum_num : oilNum.length
                }
            }
        }

    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误."
        }
    }
})

//根据station_id获取可用油枪
router.get('/gum/status/:station_id', async (ctx, next) => {
    try {
        let station_id = ctx.params.station_id;
        station_id = parseInt(station_id);

        let stationInfo = await stationModel.queryStationById(station_id);
        if ((!stationInfo) || (stationInfo.length == 0) || (!stationInfo[0].oil_gum_nums)) {
            ctx.body = {
                status : 2,
                msg : "该油站ID号没有维护对应油枪信息."
            }
            return;
        }

        gumNum = parseInt(stationInfo[0].oil_gum_nums);
        console.log(gumNum)
        let oilGum = await oilModel.queryOilGumByStation(station_id);

        let oilList = await oilModel.queryOilInfoByStationId(station_id);

        let gumList = [];

        for (let i=0; i<gumNum; i++){
            gumList[i] = {}
            gumList[i]["station_id"] = station_id
            gumList[i]["gum_num"] = i+1
            gumList[i]["disable"] = false //默认未被使用

            for (let j=0; j<oilGum.length; j++){
                let gum = oilGum[j].gum_num;
                if ((1+i) == gum) {
                    gumList[i]["disable"] = true //已被使用
                }
            }
        }

        ctx.body = {
            status : 0,
            msg : "success",
            data : {gum_list : gumList,oil_list : oilList }
        }
    } catch (error) {
        ctx.body = {
            status : 1,
            msg : "程序内部错误"
        }
    }
})

module.exports = router