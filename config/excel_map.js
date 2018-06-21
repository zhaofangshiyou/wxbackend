/**
 * Created by miah on 2018/6/7.
 * excel配置类 ,用于excel字段与中文匹配
 */

 class ExcelConfig{
    languageCH(){
        return true; 
    };
    //station_list 油站初始化列表
    station(){
        return {
            name : "站点名称",
            province : "省份",
            oil_gum_nums : "枪数",
            city : "城市",
            station_type : "站点类型",
            station_id : "站点ID",
            oil_list : "油品信息"
        }
    };
    //oilgum_list 油枪油品
    oilGum(){
        return {
            oil_name : "油品信息",
            station_name : "站点名称",
            gun_num : "油枪号"
        }
    };
    //oil_price_list 油价本来就是中文了
    //consume_detail_list 消费明细
    consumeDetail(){
        return {
            province_name : "省份",
            station_name : "站点名称",
            card_no : "卡号",
            consume_time : "消费时间",
            gun_num : "油枪号",
            oil_name : "油品信息",
            vol : "升数",
            money : "应收金额",
            ponudage : "手续费",
            discount : "优惠金额",
            pay_channel : "支付方式",
            actual_money : "实收金额",
            wallet_recv : "实际到账"
        }
    };
    // consume_list 消费汇总
    consume(){
        return {
            province_name : "省份",
            station_name : "站点名称",
            oil_name : "油品信息",
            vol : "升数",
            money : "应收金额",
            actual_money : "实收金额",
            current_time : "汇总时间",
            wallet_recv : "实际到账",
            poundage : "手续费"
        }
    };
    //recharge_detail_list 充值明细
    rechargeDetail(){
        return {
            province_name: "省份",
            station_name: "站点名称",
            card_no: "卡号",
            money: "充值金额",
            poundage: "手续费",
            charge_time: "充值时间"
        }
    };
    //rechargr_list 充值汇总
    recharge(){
        return {
            province_name : "省份",
            station_name : "站点名称",
            money : "充值金额",
            poundage : "手续费",
            deposit_money : "沉淀金额"
        }
    };
    //accounts_list 往来账就是中文
    //discount_rule_list 优惠规则列表
    discountRule(){
        return {
            province : "省份",
            station_name : "站点名称",
            oil_92 : "92号",
            oil_95 : "95号",
            oil_98 : "98号",
            oil_0 : "0号",
            oil_10 : "-10号",
            oil_20 : "20号",
            amount_start : "阈值",
            discount : "折扣",
            discount_days : "有效天数",
            discount_begin_time : "开始时间",
            discount_end_time : "结束时间"
        }
    };
    //invoice_list 发票列表
    invoice(){
        return {
            station_name : "站点名称",
            card_no : "卡号",
            cc_flow_id : "消费流水ID",
            consume_time : "消费时间",
            oil_name : "油品信息",
            vol : "升数",
            money : "金额",
            is_invoicing_name : "发票状态",
            invoice_time : "开票时间",
            operator_name : "操作员"
        }
    };
    //user_consume_detail_list用户消费明细
    userConsumeDetail(){
        return {
            card_no : "卡号",
            name : "姓名",
            open_id : "微信ID/名称",
            station_name : "消费站点",
            vol : "加油升数",
            money : "消费金额",
            consume_time : "消费时间",
            pay_channel : "支付方式"
        }
    };
    //user_card_list用户消费明细
    userCard(){
        return {
            card_no : "卡号",
            name : "姓名",
            id_card : "身份证",
            type : "用户类型",
            refund : "退款状态",
            deposit_money : "当前余额",
            created_time : "开卡时间",
            card_status : "用户状态",
            closed_time : "销卡时间",
            operated_time : "操作时间",
            initiate_by_name : "发起人",
            confirm_by_name : "确认人"
        }
    };
 }

 let excelConfig = new ExcelConfig()
 module.exports = excelConfig