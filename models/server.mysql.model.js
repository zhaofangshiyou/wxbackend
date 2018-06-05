/**
 * Created by zone on 2018/4/8.
 * sequelize 文档：https://itbilu.com/nodejs/npm/V1PExztfb.html#definition-dataType
 */
const mSequelize = require('../db/mysql_connection')
const DataTypes = require('sequelize');
const moment = require('moment');


//以下为：用户 E - R 图
let User = mSequelize.define('user', {//用户表
    id: {type: DataTypes.BIGINT(11), autoIncrement: true, primaryKey: true, unique: true, comment: '主键'}
    , open_id: DataTypes.STRING     //用户ID
    , name: DataTypes.STRING       //用户姓名
    , sex: DataTypes.STRING       //性别
    , mobile: DataTypes.STRING   //手机号
    , id_card: DataTypes.STRING  //身份证
    , car_num: DataTypes.STRING  //车牌号
    , car_type: DataTypes.STRING  //车型号
    , welfare_amount: DataTypes.DECIMAL(10, 2)     //公益金
    , total_vol: DataTypes.DECIMAL  //累计加油*
    , score: DataTypes.INTEGER  //积分
    // , totalVol: DataTypes.DECIMAL  //累计加油
    , destroy_at: DataTypes.STRING      //注销时间
    // , userId: {type: DataTypes.INTEGER, field: 'userId', allowNull: false, comment: '用户Id'}
}, {
    timestamps: true//该属性将会自动添加createdAt、updatedAt两个字段，分别表示创建和更新时间
    , underscored: true//使用下划线，自动添加的字段会在数据段中使用“蛇型命名”规则，如：createdAt在数据库中的字段名会是created_at
    , paranoid: true//虚拟删除。启用该配置后，数据不会真实删除，而是添加一个deleted_at属性
    // , indexes: [{
    //     // name: 'userAddress_userId',// tableName + field
    //     method: 'BTREE'
    //     // ,fields: ['userId']
    // }]
});


let Card = mSequelize.define('card', {//卡表
    id: {type: DataTypes.BIGINT(11), autoIncrement: true, primaryKey: true, unique: true, comment: '主键'}
    // , user_id: DataTypes.BIGINT(11)     //用户ID
    // , card_num: {type: DataTypes.INTEGER, autoIncrement: true}      //卡号*
    , card_prefix: DataTypes.INTEGER      //卡号前缀*
    , password: DataTypes.STRING      //办卡油站
    , person_balance: DataTypes.DECIMAL(10, 2)       //个人余额
    , company_balance: DataTypes.DECIMAL(10, 2)   //单位余额
    , unit_card_type: DataTypes.STRING  //卡类型
    , parent_id: DataTypes.BIGINT(11)      //主卡IDå
    , station_id: DataTypes.STRING      //办卡油站
    , status: DataTypes.STRING      //卡的可用状态 0 - 可用 1 - 不可用
    , refund_status: DataTypes.STRING      //申请退款的状态 0 - 已退款 1 - 未退款
    // , userId: {type: DataTypes.INTEGER, field: 'userId', allowNull: false, comment: '用户Id'}
}, {
    timestamps: true//该属性将会自动添加createdAt、updatedAt两个字段，分别表示创建和更新时间
    , underscored: true//使用下划线，自动添加的字段会在数据段中使用“蛇型命名”规则，如：createdAt在数据库中的字段名会是created_at
    , paranoid: true//虚拟删除。启用该配置后，数据不会真实删除，而是添加一个deleted_at属性

});

let OilFlow = mSequelize.define('oil_flow', {//加油流水,消费
    id: {type: DataTypes.BIGINT(11), autoIncrement: true, primaryKey: true, unique: true, comment: '主键'}
    // , user_id: DataTypes.BIGINT(11)     //用户ID
    , money: DataTypes.DECIMAL(10, 2)   //加油金额
    , oil_type: DataTypes.STRING  //优品类别
    , vol: DataTypes.DECIMAL(10, 2)  //升数，加油生数
    , pay_channel: DataTypes.STRING      //支付通道（1 - 个人卡，2 - 单位卡，3 - 微信支付）
    , station_id: {
        type: DataTypes.BIGINT(11)
        , allowNull: true
    }     //油站ID
    , oil_gum_num: DataTypes.STRING      //油枪号
    , deduction_amount: DataTypes.DECIMAL(10, 2)      //优惠券抵扣金额
    , come_channel: DataTypes.STRING      //入口通道
    , is_invoicing: DataTypes.STRING      //是否开过发票
    , poundage: DataTypes.DECIMAL(10, 2)  //手续费
    , card_id: DataTypes.INTEGER //卡号
    , oil_id: DataTypes.INTEGER //

    , operator: DataTypes.STRING //开发票操作员
    , cc_flow_id: DataTypes.DataTypes.BIGINT(11) //中控流水 id
    // , userId: {type: DataTypes.INTEGER, field: 'userId', allowNull: false, comment: '用户Id'}
}, {
    timestamps: true//该属性将会自动添加created_at、updated_at两个字段，分别表示创建和更新时间
    , underscored: true//使用下划线，自动添加的字段会在数据段中使用“蛇型命名”规则，如：createdAt在数据库中的字段名会是created_at
    , paranoid: true//虚拟删除。启用该配置后，数据不会真实删除，而是添加一个deleted_at属性

});


let ChargeFlow = mSequelize.define('charge_flow', {//充值流水
    id: {type: DataTypes.BIGINT(11), autoIncrement: true, primaryKey: true, unique: true, comment: '主键'}
    // , user_id: DataTypes.BIGINT(11)     //用户ID
    , money: DataTypes.DECIMAL(10, 2)   //充值金额
    , type: DataTypes.STRING   //充值类型 <1 - 个人|2 - 单位>
    , deduction_amount: DataTypes.DECIMAL(10, 2)   //优惠券抵扣金额
    , poundage: DataTypes.DECIMAL(10, 2)  //手续费
    , card_id: DataTypes.INTEGER //卡号
    // , userId: {type: DataTypes.INTEGER, field: 'userId', allowNull: false, comment: '用户Id'}
}, {
    timestamps: true//该属性将会自动添加createdAt、updatedAt两个字段，分别表示创建和更新时间
    , underscored: true//使用下划线，自动添加的字段会在数据段中使用“蛇型命名”规则，如：createdAt在数据库中的字段名会是created_at
    , paranoid: true//虚拟删除。启用该配置后，数据不会真实删除，而是添加一个deleted_at属性

});

let ScoreFlow = mSequelize.define('score_flow', {//积分流水
    id: {type: DataTypes.BIGINT(11), autoIncrement: true, primaryKey: true, unique: true, comment: '主键'}
    // , user_id: DataTypes.BIGINT(11)     //用户ID
    , comsume_score: DataTypes.STRING   //消费积分数
    , commodity_id: DataTypes.STRING   //商品ID
    , use_at: DataTypes.STRING   //使用时间
    , use_place: DataTypes.STRING   //使用地点
    // , userId: {type: DataTypes.INTEGER, field: 'userId', allowNull: false, comment: '用户Id'}
}, {
    timestamps: true//该属性将会自动添加createdAt、updatedAt两个字段，分别表示创建和更新时间
    , underscored: true//使用下划线，自动添加的字段会在数据段中使用“蛇型命名”规则，如：createdAt在数据库中的字段名会是created_at
    , paranoid: true//虚拟删除。启用该配置后，数据不会真实删除，而是添加一个deleted_at属性

});

let Discount = mSequelize.define('discount', {//优惠券表
    id: {type: DataTypes.BIGINT(11), autoIncrement: true, primaryKey: true, unique: true, comment: '主键'}
    // , user_id: DataTypes.BIGINT(11)     //用户ID
    , discount_type: DataTypes.STRING       //优惠类型
    , business_type: DataTypes.STRING   //业务类型
    , comsume_time: DataTypes.STRING   //领取时间
    , expired_time: DataTypes.STRING   //消费时间
    , support_station: DataTypes.STRING   //优惠券支持油站
    // , userId: {type: DataTypes.INTEGER, field: 'userId', allowNull: false, comment: '用户Id'}
}, {
    timestamps: true//该属性将会自动添加createdAt、updatedAt两个字段，分别表示创建和更新时间
    , underscored: true//使用下划线，自动添加的字段会在数据段中使用“蛇型命名”规则，如：createdAt在数据库中的字段名会是created_at
    , paranoid: true//虚拟删除。启用该配置后，数据不会真实删除，而是添加一个deleted_at属性

});

console.log("hasmany done1");

let Station = mSequelize.define('station', {//油站表
    id: {type: DataTypes.BIGINT(11), autoIncrement: true, primaryKey: true, unique: true, comment: '主键'}
    // station_id: DataTypes.STRING       //油站ID
    , name: DataTypes.STRING   //油站名
    , oil_list: DataTypes.STRING   //支持油品
    , avatar_url: DataTypes.STRING   //油站缩略图地址
    , longitude: DataTypes.DECIMAL(10, 7)   //经度
    , latitude: DataTypes.DECIMAL(10, 7)   //纬度
    , address: DataTypes.STRING   //详细地址
    , oil_gum_nums: DataTypes.STRING   //油枪号
    , province: DataTypes.STRING   //省份
    , city: DataTypes.STRING   //城市
    , type: {type: DataTypes.INTEGER, defaultValue: 1}  //油站类型  1自有 2共享
    , province_id: DataTypes.BIGINT(11)  //对应省份或城市ID,region_id
    , card_prefix: DataTypes.INTEGER      //卡号前缀，每个油站有一个特定的卡号前缀

}, {
    timestamps: true//该属性将会自动添加createdAt、updatedAt两个字段，分别表示创建和更新时间
    , underscored: true//使用下划线，自动添加的字段会在数据段中使用“蛇型命名”规则，如：createdAt在数据库中的字段名会是created_at
    , paranoid: true//虚拟删除。启用该配置后，数据不会真实删除，而是添加一个deleted_at属性

});
//以下为：油站 E - R 图。
let Oil = mSequelize.define('oil', {//油品表,确定不是油价表吗？
    id: {type: DataTypes.BIGINT(11), autoIncrement: true, primaryKey: true, unique: true, comment: '主键'}
    // , station_id: DataTypes.BIGINT(11)   //油站ID
    , name: DataTypes.STRING       //油品名
    , price: DataTypes.DECIMAL(10, 2)   //油价
    , active_at: DataTypes.STRING   //生效时间
    , province_id: DataTypes.INTEGER   //省份
    , city: DataTypes.STRING   //城市
    , oil_id: DataTypes.INTEGER
    // , userId: {type: DataTypes.INTEGER, field: 'userId', allowNull: false, comment: '用户Id'}
}, {
    timestamps: true//该属性将会自动添加createdAt、updatedAt两个字段，分别表示创建和更新时间
    , underscored: true//使用下划线，自动添加的字段会在数据段中使用“蛇型命名”规则，如：createdAt在数据库中的字段名会是created_at
    , paranoid: true//虚拟删除。启用该配置后，数据不会真实删除，而是添加一个deleted_at属性

});

let DiscountRule = mSequelize.define('discount_rule', {//折扣表（该表有两种优惠类型，一种为按油品类进行优惠，一种按日期进行优惠）
    id: {type: DataTypes.BIGINT(11), autoIncrement: true, primaryKey: true, unique: true, comment: '主键'}
    , oil_type: DataTypes.STRING       //油的种类
    // , station_id: DataTypes.BIGINT(11)   //油站ID
    , oil_92: DataTypes.STRING   //92号油的优惠规则
    , oil_95: DataTypes.STRING   //95号油的优惠规则
    , oil_98: DataTypes.STRING   //98号油的优惠规则
    , oil_0: DataTypes.STRING   //0号油的优惠规则
    , oil_10: DataTypes.STRING   //-10号油的优惠规则
    , oil_20: DataTypes.STRING   //-20号油的优惠规则
    , amount_start: DataTypes.DECIMAL(10, 2)   //优惠起始金额
    , discount_type: DataTypes.STRING   //优惠类型，使用哪种优惠规则以此为判断
    , discount_date_start: DataTypes.DATE()   //优惠日期
    , discount_date_end: DataTypes.DATE()   //优惠日期
    , discount: DataTypes.DECIMAL(10, 2)   //折扣
    , discount_days: DataTypes.INTEGER //折扣天数
    
    // , statin_id: DataTypes.STRING   //油站ID

    // , userId: {type: DataTypes.INTEGER, field: 'userId', allowNull: false, comment: '用户Id'}
}, {
    timestamps: true//该属性将会自动添加createdAt、updatedAt两个字段，分别表示创建和更新时间
    , underscored: true//使用下划线，自动添加的字段会在数据段中使用“蛇型命名”规则，如：createdAt在数据库中的字段名会是created_at
    , paranoid: true//虚拟删除。启用该配置后，数据不会真实删除，而是添加一个deleted_at属性

});


//站内油枪和油品对应关系表 2018-5-15 miah
let OilGum = mSequelize.define('oil_gum', {
    id: {type: DataTypes.BIGINT(11), autoIncrement: true, primaryKey: true, unique: true, comment: '主键'},
    oil_id: DataTypes.INTEGER,       //油品名
    station_id: DataTypes.BIGINT(11),   //油站ID
    gum_num: DataTypes.INTEGER    //油枪编码
}, {
    timestamps: true,//该属性将会自动添加createdAt、updatedAt两个字段，分别表示创建和更新时间
    underscored: true,//使用下划线，自动添加的字段会在数据段中使用“蛇型命名”规则，如：createdAt在数据库中的字段名会是created_at
    paranoid: true//虚拟删除。启用该配置后，数据不会真实删除，而是添加一个deleted_at属性

});

//国家省份城市对应关系
let Region = mSequelize.define('region', {
    id: {type: DataTypes.BIGINT(11), autoIncrement: true, primaryKey: true, unique: true, comment: '主键'},
    type: DataTypes.STRING,  //地区类型，国家nation N,省份province P,城市city C
    //code: DataTypes.STRING,  //编码，禁止中文
    name: DataTypes.STRING,  //名字中文
    parent_id: DataTypes.BIGINT(11)   //树形结构存储
}, {
    timestamps: true,//该属性将会自动添加createdAt、updatedAt两个字段，分别表示创建和更新时间
    underscored: true,//使用下划线，自动添加的字段会在数据段中使用“蛇型命名”规则，如：createdAt在数据库中的字段名会是created_at
    paranoid: true//虚拟删除。启用该配置后，数据不会真实删除，而是添加一个deleted_at属性
});
console.log("hasmany done1");

//油品信息列表
let OilInfo = mSequelize.define('oil_info', {
    id: {type: DataTypes.BIGINT(11), autoIncrement: true, primaryKey: true, unique: true, comment: '主键'},
    //code: DataTypes.STRING,  //油品编码，禁止中文
    name: DataTypes.STRING   //油品名字
}, {
    timestamps: true,//该属性将会自动添加createdAt、updatedAt两个字段，分别表示创建和更新时间
    underscored: true,//使用下划线，自动添加的字段会在数据段中使用“蛇型命名”规则，如：createdAt在数据库中的字段名会是created_at
    paranoid: true//虚拟删除。启用该配置后，数据不会真实删除，而是添加一个deleted_at属性
});

//优惠文案
let DiscountDoc = mSequelize.define('discount_doc', {
    id: {type: DataTypes.BIGINT(11), autoIncrement: true, primaryKey: true, unique: true, comment: '主键'},
    title: DataTypes.STRING,  //标题
    content: DataTypes.TEXT('long'),  //内容
}, {
    timestamps: true,//该属性将会自动添加createdAt、updatedAt两个字段，分别表示创建和更新时间
    underscored: true,//使用下划线，自动添加的字段会在数据段中使用“蛇型命名”规则，如：createdAt在数据库中的字段名会是created_at
    paranoid: true//虚拟删除。启用该配置后，数据不会真实删除，而是添加一个deleted_at属性
});

//退款表
let Refund = mSequelize.define('refund', {
    id: {type: DataTypes.BIGINT(11), autoIncrement: true, primaryKey: true, unique: true, comment: '主键'},
    card_id : DataTypes.BIGINT(11),  //卡id
    money : DataTypes.DECIMAL(10, 2),  //退款金额
    initiate_by : DataTypes.BIGINT(11),  //发起人id
    confirm_by : DataTypes.BIGINT(11),  //确认人id
    status : DataTypes.INTEGER  //退款进度 1申请中  2已完成
}, {
    timestamps: true,//该属性将会自动添加createdAt、updatedAt两个字段，分别表示创建和更新时间
    underscored: true,//使用下划线，自动添加的字段会在数据段中使用“蛇型命名”规则，如：createdAt在数据库中的字段名会是created_at
    paranoid: true//虚拟删除。启用该配置后，数据不会真实删除，而是添加一个deleted_at属性
});

//后台用户
let BackendUser = mSequelize.define('backend_user', {
    id: {type: DataTypes.BIGINT(11), autoIncrement: true, primaryKey: true, unique: true, comment: '主键'},
    name : DataTypes.STRING,  //用户名
    password : DataTypes.STRING,  //退款金额
    permissions : DataTypes.STRING,  //权限
    role : DataTypes.STRING,  //角色
    admin : DataTypes.INTEGER, //0不是管理员 ， 1管理员
    dept : DataTypes.STRING, //用户所属部门
}, {
    timestamps: true,//该属性将会自动添加createdAt、updatedAt两个字段，分别表示创建和更新时间
    underscored: true,//使用下划线，自动添加的字段会在数据段中使用“蛇型命名”规则，如：createdAt在数据库中的字段名会是created_at
    paranoid: true//虚拟删除。启用该配置后，数据不会真实删除，而是添加一个deleted_at属性
});

Station.hasMany(Oil, {foreignKey: 'station_id', targetKey: 'id'});
Station.hasMany(DiscountRule, {foreignKey: 'station_id', targetKey: 'id'});

Station.hasMany(OilFlow, {foreignKey: 'station_id', targetKey: 'id'});
// OilFlow.hasOne(Station, {
//     foreignKey: 'oil_flow_id', targetKey: 'id'
//     , allowNull: true
//     , defaultValue: null
//     , constraints: false
// })
console.log("hasmany done");
User.hasMany(Card, {foreignKey: 'user_id', targetKey: 'id'});
// Card.hasOne(User,{foreignKey: 'card_id', targetKey: 'id'})


User.hasMany(OilFlow, {foreignKey: 'user_id', targetKey: 'id'});
User.hasMany(ChargeFlow, {foreignKey: 'user_id', targetKey: 'id'});
User.hasMany(ScoreFlow, {foreignKey: 'user_id', targetKey: 'id'});
User.hasMany(Discount, {foreignKey: 'user_id', targetKey: 'id'});
Region.hasMany(Oil, {foreignKey: 'province_id', targetKey: 'id'});

OilFlow.sync();
ChargeFlow.sync();
// User.sync({force: true});
// DiscountRule.sync({force: true});
mSequelize.sync();
// mSequelize.sync({force: true});//慎用，会清空数据库所有数据表,然后重新建表

module.exports = new Map([
    ['User', User]//用户表
    , ['Card', Card]//兆方卡表
    , ['OilFlow', OilFlow]//消费流水--加油流水
    , ['Station', Station]//油站表
    , ['Oil', Oil]//油品表   油品价格表
    , ['ChargeFlow', ChargeFlow]//充值流水表
    , ['ScoreFlow', ScoreFlow]//积分流水表
    , ['Discount', Discount]//优惠表
    , ['DiscountRule', DiscountRule]//优惠规则表
    , ['OilInfo', OilInfo]  //油品表
    , ['Region', Region]  //国家省份城市表
    , ['OilGum', OilGum]   //油枪油品对照
    , ['DiscountDoc',DiscountDoc] //优惠文案
    , ['Refund', Refund] //退款表
    , ['BackendUser',BackendUser] //后台用户表
]);


