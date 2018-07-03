/**
 * @fileOverview pandora-cli 工具方法
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-26 | sizhao       // 初始版本
*/

const chalk = require('chalk')
require('console.table')
const gitConfig = require('gitconfig')
const fs = require('fs')
const path = require('path')
const deepExtend = require('deep-extend')

function log (message = '', type, timestamp = true) {
  const date = new Date()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()

  console.log(timestamp ? chalk.gray(`[${hours}:${minutes}:${seconds}]`) : '', type ? chalk[type](message) : message)
}

log.success = (message) => {
  log(message, 'green')
}

log.error = (message, error) => {
  log(message, 'red')
  error && console.error(error)
}

log.info = (message) => {
  log(message, 'yellow')
}

log.line = (num = 1) => {
  console.log(' '.padEnd(num, '\n'))
}

log.table = (list) => {
  list = list.map(item => {
    let firstKey = true
    for ( const key in item ) {
      if (firstKey) {
        item[key] = chalk.cyan(item[key])
      } else {
        item[key] = chalk.gray(item[key])
      }
      firstKey = false
    }

    return item
  })
  console.table(list)
}

// 获取配置
function getConfig (configPath) {
  try {
    fs.accessSync(configPath, fs.constants.F_OK | fs.constants.W_OK)
  } catch(error) {
    return {}
  }
  return require(configPath)
}

// 生成日期
function currentDate () {
  const date = new Date()
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}:${`${date.getDate()}`.padStart(2, '0')}`
}

module.exports = {
  log,
  getGitUser () {
    return gitConfig.get({
      location: 'global'
    }).then(({ user = {} } = {}) => {
      return user
    })
  },
  getConfig,
  // 保存配置
  saveConfig (config, configPath) {
    let originalConfig = getConfig(configPath)
    config = deepExtend(originalConfig, config)
    const stream = fs.createWriteStream(configPath)
    stream.end(JSON.stringify(config, null, '  '))
  },
  // 创建文件夹
  mkdir (dirPath) {
    if (!dirPath) {
      return
    }
    fs.mkdirSync(dirPath)
  },
  // 绘制字节码
  renderAscii () {
    const ascii = fs.readFileSync(path.resolve(__dirname, '../resource/ascii-pandolajs.txt'))
    log('', null, false)
    log(ascii, 'green', false)
    log('', null, false)
  },
  // 获取 cwd
  getCwd (configPath) {
    const confdir = path.dirname(configPath)
    let { cwd } = getConfig(configPath)
    if (cwd === undefined) {
      cwd = confdir
    }
    return /^\./.test(cwd) ? path.resolve(confdir, cwd) : cwd
  },
  currentDate,
  template (content = '', inject) {
    return content.replace(/@{([^}]+)}/ig, (m, key) => {
      return inject[key.trim()]
    })
  },
  // 创建多级目录
  mkdirs (dirs, cwd) {
    const reg = new RegExp(`^(?:${cwd})\\/`)
    if (!reg.test(dirs)) {
      throw new Error('mkdirs fails...')
    }
    const splits = dirs.replace(reg, '').split('\/')
    let goon = cwd
    !fs.existsSync(goon) && fs.mkdirSync(goon)
    splits.forEach(chunk => {
      goon = path.join(goon, chunk)
      !fs.existsSync(goon) && fs.mkdirSync(goon)
    })
  },
  // 版本比较
  versionCompare (v1, v2) {
    const curVer = v1.split('.')
    const specVer = v2.split('.')
  
    for(let i = 0, len = curVer.length; i < len; i ++){
      if(curVer[i] !== specVer[i]){
        return curVer[i] - specVer[i] > 0 ? true : false
      }
      if(i >= len - 1){
        return false
      }
    }
  }
}