let fs = require('fs')
let ini = require('ini')
let path = require('path')

let default_config = {
    log: {
        "level": "debug"
    },
    http: {
        "listen_port": 1228,
        "ssl": false
    }
}

try {
    let d = null
    let prodEnv = false
    // __dirname 对应 proccess.cwd()
    if (process.pkg && process.pkg.entrypoint){
        d = fs.readFileSync(path.resolve(process.cwd(), "cfg.ini"))
        prodEnv = true
    }else {
        d = fs.readFileSync(path.resolve(__dirname, "../cfg.ini"))
    }
    let config = ini.parse(d.toString(), 'utf-8')
    default_config = config
    if (prodEnv){
        default_config.env = "prod"
    }
}catch (e){
    console.error(e)
    console.log("start sdp_engine failure!")
    // fs.writeFileSync(path.resolve(__dirname, "../cfg.ini"), ini.stringify(default_config, { section: 'section' }))
}

module.exports = default_config



