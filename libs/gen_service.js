let os = require('os')
let fs = require('fs')
let path = require('path')
let {logger} = require('./logger')
let child_process = require('child_process');
let cfgTmpl = require('../template/cfg_tmpl')

const service_template = (desc, proName, proPath)=>{
    return `
[Unit]
# 应用描述
Description=${desc}
# 应用文档地址

[Service]
# 进程启动方式，有：simple(默认), forking, oneshot, notify, dbus, idle这几种方式
Type=simple
# 启动程序
WorkingDirectory=${proPath}
ExecStart=${proPath}/${proName}
# 启动服务之后执行的命令
ExecStartPost=/bin/echo "start ${proName} success."
# 停止服务时执行的命令
#ExecStop=/bin/echo "stop ${proName}... "
# 重启服务时执行的命令
#ExecReload=/bin/kill -s HUP $MAINPID
# 进程结束后重启方式，可选值有：always, on-success, on-failure, on-abnormal, on-abort, on-watchdog
Restart=always
# 重启间隔秒数
#RestartSec=30
# 标准输出到
StandardOutput=syslog
# 标准错误输出到
StandardError=syslog
# 设置syslog中log的程序名称
SyslogIdentifier=${proName}
# 设置syslog中log类型
SyslogFacility=local0
# 设置syslog中log级别，此处为info
SyslogLevel=info
# 程序运行时的用户
User=root
# 程序运行时分配的组
Group=root
# 程序的环境变量
Environment=NODE_ENV=production

# 依赖于
[Install]
WantedBy=multi-user.target
`
}

const installToService = (programName, isGenCfg = false)=>{
    try {
        if (!(process.pkg && process.pkg.entrypoint)) {
            logger.warn("only support creat at prod!")
            process.exit(0);
            return;
        }
        if (os.platform()=="linux"){
            // /etc/systemd/system
            logger.info("install service");
            let srvTemplate = service_template(programName + " service", programName, path.resolve(process.cwd()))
            fs.writeFileSync('/etc/systemd/system/'+programName+'.service', srvTemplate);
            child_process.execSync(`systemctl daemon-reload`)
            child_process.execSync(`systemctl enable ${programName}`)

            if (isGenCfg) {
                logger.info("生成cfg.ini配置文件, 请修改相关配置文件")
                let write_path = fs.readFileSync(path.resolve(process.cwd(), "cfg.ini"))
                fs.writeFileSync(write_path, cfgTmpl)
            }
            logger.info("安装成功!")
            logger.info("使用方式如下: ")
            logger.info("启动程序: systemctl start " + programName)
            logger.info("停止程序: systemctl stop " + programName)
            process.exit(0);
        }else {
            logger.info(`platform: ${os.platform()} is not support!`)
        }
    }catch (err){
        logger.error(err)
        process.exit(0);
    }
}

exports.installToService = installToService
