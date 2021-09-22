/**
 * create by xuhang 2018/08/27
 */
const log4js = require('log4js');
const path = require('path');
const config = require('./conf')
let logPath
if (config.env=="prod"){
    logPath = path.resolve(process.cwd(), "log");
}else {
    logPath = path.resolve(__dirname, "../log");
}

const _logConfigRule = {
    appenders: {
        run: {
            "type": "file",
            "filename": logPath + '/run.log',
            "maxLogSize": 104857600,
            "numBackups": 3,
            "category": "run"
        },
        stdout:{
            type: 'console'
        }
    },
    categories: {
        default:{appenders: ["run", "stdout"], "level": config.log.level}
    }
}

log4js.configure(_logConfigRule)

exports.logger = log4js.getLogger("run");
