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
  }
}