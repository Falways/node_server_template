let createError = require('http-errors');
let express = require("express")
let http_log = require('morgan')
let {logger} = require('./libs/logger')
let conf = require('./libs/conf')
let path = require('path');
let utils = require('./libs/utils');
let default_ssl = require('./libs/ssl')

let app = express()
let https = require('https')
let http = require('http')
let fs = require('fs')
const {installToService} = require("./libs/gen_service");
const e = require("express");

process.argv.splice(0,2)
let passArgs = process.argv
if(passArgs[0] == "install") {
    logger.info("install service");
    installToService('rr_server', true)
    process.exit(0);
    return;
}

let isProd = (process.pkg && process.pkg.entrypoint)
let currentPath = "";
if (isProd){
    currentPath = path.resolve(process.cwd(), "certs")
}else {
    currentPath = path.resolve(__dirname, "certs")
}

app.use(http_log('dev'))
app.use(express.json())

app.use(function (req, res, next) {
    logger.debug(`client_ip: ${utils.getClientIp(req)}, req: body => ${JSON.stringify(req.body)} , query => ${JSON.stringify(req.query)}`)
    next()
})

// 注册路由
app.use('/', require('./router/rrweb'));

app.use(function(req, res, next) {
    next(createError(404));
});

app.set('port', conf.http.listen_port)


let ssl_key = path.join(currentPath, "ssl_key.key")
let ssl_cert = path.join(currentPath, "ssl_crt.crt")
if (!fs.existsSync(ssl_key) || !fs.existsSync(ssl_cert)) {
    logger.error("ssl not exits will auto create default ssl file! (证书不存在，生成默认证书)")
    if (!fs.existsSync(currentPath)) fs.mkdirSync(currentPath);
    fs.writeFileSync(ssl_key, default_ssl.ssl_key)
    fs.writeFileSync(ssl_cert, default_ssl.ssl_crt)
}

const options = {
    key:fs.readFileSync(ssl_key),
    cert:fs.readFileSync(ssl_cert)
}

let server = null
if (conf.http.ssl) {
    server = https.createServer(options, app)
}else{
    server = http.createServer(app)
}

server.listen(conf.http.listen_port);

server.on('error', function (err){
    logger.error(err)
})

server.on('listening', function (){
    logger.info("server running at 0.0.0.0:" + conf.http.listen_port);
});
