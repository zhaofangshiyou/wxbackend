/**
 * Created by zone on 2018/1/5.
 */
const mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
    nickname: {
        type: String,
        default: "匿名"
    },//真实姓名
    account: String,//账号
    password: String,//密码
    role: String//扮演的角色
});

var AddressSchema = new mongoose.Schema({
    addressName: String,
    positiveCount: String,
    negativeCount: String,
    money: Number
});


var EventSchema = new mongoose.Schema({

    address: String,
    checkAccount: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},//
    status: String,//状态：未处理，正在处理，已经处理
    description: String,//城管/村长催这个事件的描述
    pictures: [String],//图片数组
    check: String,//
    suggession: String,//
    leadershipAccount: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},//
    createTime: {
        type: Date,
        default: Date.now
    }//注册时间
});

mongoose.model("User", UserSchema);
mongoose.model("Address", AddressSchema);
mongoose.model("Event", EventSchema);
















