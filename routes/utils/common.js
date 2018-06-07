/**
 * Created by zone on 2018/5/7.
 * 公有工具类，相当于大杂烩
 */
class Common {
    //计算两个经纬度的距离，单位精确到 m/米
     getDistance({latitude: lat1, longitude: lng1}, {latitude: lat2, longitude: lng2}) {
         // console.log(typeof lat1)
         // console.log(typeof lng1)
        let deg2rad = (deg) => deg * (Math.PI / 180)
        let R = 6371 // Radius of the earth in km
        let dLat = deg2rad(parseFloat(lat2) - parseFloat(lat1))  // deg2rad below
        let dLng = deg2rad(parseFloat(lng2) - parseFloat(lng1))
        let a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return Math.round(R * c * 1000) // Distance in m
    }

     //与中控系统 oil_type 进行转换
    exchangeOilType(oil_type){
         let map = new Map([
             ['0#柴油', "oil_0"]//
             , ['92#汽油', "oil_92"]//
             , ['95#汽油', "oil_98"]//
             , ['98#汽油', "oil_98"]//
             , ['-10#柴油', "oil_10"]//
             , ['-20#柴油', "oil_20"]//

         ]);
        return map.get(oil_type);
    }

     //获取随机数
     getRandomInt() {
        let num = Math.floor(Math.random() * 10);
        return num;
    }

    //请求前置处理，对必要参数进行判断,如果不符合返回true
    reqParamsIsNull(params) {
        let result = true;
        if (typeof(params) != "object") {
            return result;
        }

        for (var i in params) {
            if ((!params[i]) || (params[i]=="")){
                return result;
            }
        }
        result = false;
        return result;
    };

     //字符串是否json格式
    isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };
}

let common = new Common();
module.exports = common

