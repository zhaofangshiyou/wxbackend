/**
 * Created by zone on 2018/5/7.
 * 公有工具类，相当于大杂烩
 */
const XLSX = require('xlsx');


class Common {

    getDistance({latitude: lat1, longitude: lng1}, {latitude: lat2, longitude: lng2}) {//计算两个经纬度的距离，单位精确到 m/米
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

    getRandomInt() {

        let num = Math.floor(Math.random() * 10);
        return num;
    }

    s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    toExcelBuf(_headers, _data, sheetName = 'sheet1') {//将数据库数据转成 Excel buffer
        //******
        // var _headers = ['id', 'name', 'age', 'country', 'remark']
        // var _data = [ { id: '1',
        //     name: 'test1',
        //     age: '30',
        //     country: 'China',
        //     remark: 'hello' },
        //     { id: '2',
        //         name: 'test2',
        //         age: '20',
        //         country: 'America',
        //         remark: 'world' },
        //     { id: '3',
        //         name: 'test3',
        //         age: '18',
        //         country: 'Unkonw',
        //         remark: '???' } ];
        //******


        var headers = _headers
        // 为 _headers 添加对应的单元格位置
        // [ { v: 'id', position: 'A1' },
        //   { v: 'name', position: 'B1' },
        //   { v: 'age', position: 'C1' },
        //   { v: 'country', position: 'D1' },
        //   { v: 'remark', position: 'E1' } ]
            .map((v, i) => Object.assign({}, {v: v, position: String.fromCharCode(65 + i) + 1}))
            // 转换成 worksheet 需要的结构
            // { A1: { v: 'id' },
            //   B1: { v: 'name' },
            //   C1: { v: 'age' },
            //   D1: { v: 'country' },
            //   E1: { v: 'remark' } }
            .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {});
        var data = _data
        // 匹配 headers 的位置，生成对应的单元格数据
        // [ [ { v: '1', position: 'A2' },
        //     { v: 'test1', position: 'B2' },
        //     { v: '30', position: 'C2' },
        //     { v: 'China', position: 'D2' },
        //     { v: 'hello', position: 'E2' } ],
        //   [ { v: '2', position: 'A3' },
        //     { v: 'test2', position: 'B3' },
        //     { v: '20', position: 'C3' },
        //     { v: 'America', position: 'D3' },
        //     { v: 'world', position: 'E3' } ],
        //   [ { v: '3', position: 'A4' },
        //     { v: 'test3', position: 'B4' },
        //     { v: '18', position: 'C4' },
        //     { v: 'Unkonw', position: 'D4' },
        //     { v: '???', position: 'E4' } ] ]
            .map((v, i) => _headers.map((k, j) => Object.assign({}, {
                v: v[k],
                position: String.fromCharCode(65 + j) + (i + 2)
            })))
            // 对刚才的结果进行降维处理（二维数组变成一维数组）
            // [ { v: '1', position: 'A2' },
            //   { v: 'test1', position: 'B2' },
            //   { v: '30', position: 'C2' },
            //   { v: 'China', position: 'D2' },
            //   { v: 'hello', position: 'E2' },
            //   { v: '2', position: 'A3' },
            //   { v: 'test2', position: 'B3' },
            //   { v: '20', position: 'C3' },
            //   { v: 'America', position: 'D3' },
            //   { v: 'world', position: 'E3' },
            //   { v: '3', position: 'A4' },
            //   { v: 'test3', position: 'B4' },
            //   { v: '18', position: 'C4' },
            //   { v: 'Unkonw', position: 'D4' },
            //   { v: '???', position: 'E4' } ]
            .reduce((prev, next) => prev.concat(next))
            // 转换成 worksheet 需要的结构
            //   { A2: { v: '1' },
            //     B2: { v: 'test1' },
            //     C2: { v: '30' },
            //     D2: { v: 'China' },
            //     E2: { v: 'hello' },
            //     A3: { v: '2' },
            //     B3: { v: 'test2' },
            //     C3: { v: '20' },
            //     D3: { v: 'America' },
            //     E3: { v: 'world' },
            //     A4: { v: '3' },
            //     B4: { v: 'test3' },
            //     C4: { v: '18' },
            //     D4: { v: 'Unkonw' },
            //     E4: { v: '???' } }
            .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {});
// 合并 headers 和 data
        var output = Object.assign({}, headers, data);
// 获取所有单元格的位置
        var outputPos = Object.keys(output);
// 计算出范围
        var ref = outputPos[0] + ':' + outputPos[outputPos.length - 1];
// 构建 workbook 对象
        var wb = {
            SheetNames: [sheetName],
            Sheets: {
                'sheet1': Object.assign({}, output, {'!ref': ref})
            }
        };
// 导出 Excel
        XLSX.writeFile(wb, 'output.xlsx');
        var wopts = {bookType: 'xlsx', bookSST: false, type: 'buffer'};
        var wbout = XLSX.write(wb, wopts);
        return wbout
    }

}

let common = new Common();
module.exports = common

