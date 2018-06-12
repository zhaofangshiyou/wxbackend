/*
 * create by zone on 2018/04/08
 * 项目的起始文件，引用各类第三方库，路由，错误处理，body 解析
 */
const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const xmlParser = require('koa-xml-body')
const logger = require('koa-logger')
const cors = require('@koa/cors');

const index = require('./routes/index')
const token = require('./routes/token')
const user = require('./routes/user')
const card = require('./routes/card')
const query = require('./routes/query')
const message = require('./routes/message')
const station = require('./routes/station')
const pay = require('./routes/pay')


const addData = require('./routes/add_data')

//backen
const backen_station = require('./routes/backen/station')
const backen_invoice = require('./routes/backen/invoice')
const backen_public = require('./routes/backen/public')
const backen_oil = require('./routes/backen/oil')
const backen_region = require('./routes/backen/region')
const backen_oil_price = require('./routes/backen/oil_price')
const backen_report_financial = require('./routes/backen/financial')
const backen_report_discount = require('./routes/backen/discount')
const backen_users = require('./routes/backen/users')
const backen_auth = require('./routes/backen/auth')

const config = require('./config/config');
console.log("==console== app.js")
console.log(config.REDIS_HOST)
// error handler
onerror(app)

app.use(cors());

// middlewares
app.use(xmlParser())
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})



// routes
app.use(index.routes(), index.allowedMethods())
app.use(token.routes(), token.allowedMethods())
app.use(user.routes(), user.allowedMethods())
app.use(card.routes(), card.allowedMethods())
app.use(query.routes(), query.allowedMethods())
app.use(message.routes(), message.allowedMethods())
app.use(station.routes(), station.allowedMethods())
app.use(pay.routes(), pay.allowedMethods())
app.use(addData.routes(), addData.allowedMethods())

// backen routes
app.use(backen_station.routes(), backen_station.allowedMethods())
app.use(backen_invoice.routes(), backen_invoice.allowedMethods())
app.use(backen_public.routes(), backen_public.allowedMethods())
app.use(backen_oil.routes(), backen_oil.allowedMethods())
app.use(backen_region.routes(),backen_region.allowedMethods())
app.use(backen_oil_price.routes(),backen_oil_price.allowedMethods())
app.use(backen_report_financial.routes(),backen_report_financial.allowedMethods())
app.use(backen_report_discount.routes(),backen_report_discount.allowedMethods())
app.use(backen_users.routes(),backen_users.allowedMethods())
app.use(backen_auth.routes(),backen_auth.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
