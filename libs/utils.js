const FAILURE_TAG = 'illegal_hexStr'

function Cookie() {
    let name = ''
    let value = ''
    let domain = ''
    let hostOnly = false
    let path = ''
    let expires = NaN
    let isExpired = false
    let secure = false
    let httpOnly = false
    let sameSite = ''
    return {
        name,
        value,
        domain,
        hostOnly,
        path,
        expires,
        isExpired,
        secure,
        httpOnly,
        sameSite
    }
}

const str2Hex = function (str) {
    str = str.trim()
    if (str.length==0) return "";
    let hexCode = []
    for (let i=0 ;i < str.length; i++){
        let _pi = str.charCodeAt(i).toString(16)
        hexCode.push(_pi)
    }
    return hexCode.join("")
}

const hex2Str = function(hexStr) {
    try {
        hexStr = hexStr.trim()
        if (hexStr.length==0) return "";
        if (hexStr.substr(0,2).toLowerCase() === '0x') {
            hexStr = hexStr.substr(2)
        }
        let len = hexStr.length
        if (len & 1 === 1) {
            return FAILURE_TAG
        }
        let strCode = []
        for (let i = 0; i < len; i+=2) {
            let _strI = parseInt(hexStr.substr(i,2), 16)
            strCode.push(String.fromCharCode(_strI))
        }
        return strCode.join("")
    }catch (e){
        return FAILURE_TAG
    }
}

const wordBoundaryUpperCase = (str)=>{
    let reg = /\b(\w)|\s(\w)/g;
    str = str.toLowerCase();
    return str.replace(reg,function(m){
        return m.toUpperCase()
    })
}

/**
 * str为cookie字符串
 * str = cna=kj5sGC7p+1MCAXFBEQ2cnaWn; __ysuid=1619150850665EL2;
 * @param str
 * @returns {{}|null}
 */
const parseCookie2Obj = (str)=>{
    if (!str){return null}
    let cookieObj = {}
    let cookieArr = str.split(';')
    cookieArr.forEach(item=>{
        let itemArr = item.split("=")
        cookieObj[itemArr[0].trim()] = itemArr[1]
    })
    return cookieObj
}

/**
 * cookie对象转换为cookie字符串
 * @param cObj
 * @returns {string}
 */
const objToCookieStr = (cObj)=>{
    if (!cObj || Object.keys(cObj).length<=0){
        return ""
    }
    let cookieStr = ""
    for (const key in cObj) {
        let item = key+'='+cObj[key]
        cookieStr += item +';'
    }
    return cookieStr
}

/**
 * 注意：解析set-cookies的每一项
 * @param str
 * @returns {{path: string, expires: number, domain: string, hostOnly: boolean, sameSite: string, name: string, httpOnly: boolean, isExpired: boolean, secure: boolean, value: string}}
 */
const resolveCookie = (str)=>{
    const item = Cookie()
    const arr = str.split(';')

    for (let i = 0; i < arr.length; i++) {
        let key, val
        const s = arr[i].trim()
        const p = s.indexOf('=')

        if (p !== -1) {
            key = s.substr(0, p)
            val = s.substr(p + 1)
        } else {
            //
            // cookie = 's; secure; httponly'
            //  0: { key: '', val: 's' }
            //  1: { key: 'secure', val: '' }
            //  2: { key: 'httponly', val: '' }
            //
            key = (i === 0) ? '' : s
            val = (i === 0) ? s : ''
        }

        if (i === 0) {
            item.name = key
            item.value = val
            continue
        }
        console.log(key)
        switch (key.toLocaleLowerCase()) {
            case 'expires':
                item.expires = val
                break
            case 'domain':
                if (val[0] === '.') {
                    val = val.substr(1)
                }
                item.domain = val
                break
            case 'path':
                item.path = val
                break
            case 'httponly':
                item.httpOnly = true
                break
            case 'secure':
                item.secure = true
                break
            case 'samesite':
                item.sameSite = val
                break
        }
    }
    return item
}

/**
 * 注意：还原的cookie的一项
 * @param cookie
 * @returns {string}
 */
const cookieObjToStr = (cookie)=>{
    let str = `${cookie.name}=${cookie.value};path=${cookie.path};`;
    if (cookie.domain){
        str+=`domain=${cookie.domain};`
    }
    if (cookie.hostOnly){
        str+=`hostOnly;`;
    }
    if (cookie.expires){
        str+=`expires=${cookie.expires};`
    }
    if (cookie.isExpired){
        str+=`isExpired;`
    }
    if (cookie.secure){
        str+=`secure;`
    }
    if (cookie.httpOnly){
        str+=`httpOnly;`
    }
    if (cookie.sameSite){
        str+=`sameSite=${cookie.sameSite};`
    }
    return str;
}

const getClientIp = function (req) {
    let ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||

        req.connection.socket.remoteAddress || '';
    if (ip.split(',').length > 0) {
        ip = ip.split(',')[0];
    }
    return ip;
};


exports.parseCookie2Obj = parseCookie2Obj
exports.objToCookieStr = objToCookieStr
exports.cookieObjToStr = cookieObjToStr
exports.resolveCookie = resolveCookie
exports.hex2Str = hex2Str
exports.str2Hex = str2Hex
exports.wordBoundaryUpperCase = wordBoundaryUpperCase
exports.getClientIp = getClientIp
exports.FAILURE_TAG = FAILURE_TAG
