/**
 * @fileOverview pandora-cli 工具方法
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-26 | sizhao       // 初始版本
*/

const chalk = require('chalk')
require('console.table')
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const deepExtend = require('deep-extend')
const globby = require('globby')
const { HOOK_DIR } = require('./constants')
const Inquirer = require('inquirer')
const findup = require('find-up')

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
  if (!fs.existsSync(configPath)) {
    return {}
  }
  return require(configPath)
}

// 生成日期
function currentDate () {
  const date = new Date()
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`
}

// 递归读文件
function readFiles (dir, options, done) {
  if (!fs.existsSync(dir)) {
    throw new Error(`The file ${dir} does not exist.`)
  }
  if (typeof options === 'function') {
    done = options
    options = {}
  }
  options = Object.assign({}, {
    cwd: dir,
    dot: true,
    absolute: true,
    onlyFiles: true
  }, options)

  const files = globby.sync('**/**', options)
  files.forEach(file => {
    done({
      path: file,
      content: fs.readFileSync(file, {encoding: 'utf8'})
    })
  })
}

// 获取项目的 cwd, 支持手动配置
function getCwd (configPath) {
  const confdir = path.dirname(configPath)
  let { cwd } = getConfig(configPath)
  if (cwd === undefined) {
    cwd = confdir
  }
  return /^\./.test(cwd) ? path.resolve(confdir, cwd) : cwd
}

// 渲染二进制图
function renderAscii () {
  const ascii = fs.readFileSync(path.resolve(__dirname, '../resource/ascii-pandolajs.txt'))
  log('', null, false)
  log(ascii, 'green', false)
  log('', null, false)
}

// 保存配置
function saveConfig (config, configPath) {
  let originalConfig = getConfig(configPath)
  config = deepExtend(originalConfig, config)
  return new Promise(resolve => {
    const stream = fs.createWriteStream(configPath)
    stream.end(JSON.stringify(config, null, '  '), 'utf8', () => {
      resolve()
    })
  })
}

// inject prompt
function injectPrompt (prompts = [], injectData = {}) {
  return prompts.map(prompt => {
    ['message', 'default', 'choices', 'validate', 'filter', 'when'].forEach(key => {
      const orign = prompt[key]
      if (typeof orign === 'function') {
        prompt[key] = function () {
          return orign.apply(this, [injectData, ...(Array.prototype.slice.call(arguments))])
        }
      }
    })
    return prompt
  })
}

module.exports = {
  log,
  getGitUser () {
    let name = ''
    let email = ''
    const isGitRepository = findup.sync('.git') !== null
    const flag = isGitRepository ? '--local' : '--global'

    try {
      name = execSync(`git config ${flag} --get user.name`)
      if (!name && !isGitRepository) {
        name = execSync('git config --global --get user.name')
      }
      email = execSync(`git config ${flag} --get user.email`)
      if (!email && !isGitRepository) {
        email = execSync('git config --global --get user.email')
      }
    } catch (error) {}

    return {
      name: name.toString().trim(),
      email: email.toString().trim()
    }
  },
  getConfig,
  // 保存配置
  saveConfig,
  // 创建文件夹
  mkdir (dirPath) {
    if (!dirPath) {
      return
    }
    !fs.existsSync(dirPath) && fs.mkdirSync(dirPath)
  },
  // 绘制字节码
  renderAscii,
  // 获取 cwd
  getCwd,
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
    const semver = ['major', 'minor', 'patch']

    for(let i = 0, len = curVer.length; i < len; i ++){
      if(curVer[i] !== specVer[i]){
        return curVer[i] - specVer[i] > 0 ? { semver: semver[i], upgrade: true } : { upgrade: false }
      }
      if(i >= len - 1){
        return { upgrade: false }
      }
    }
  },
  // 递归读取文件
  readFiles,
  // 加载并执行命令
  loadCmd ({ cmds = [], argvs = {}, alias = [] }, config, exec = false) {
    if (!config) {
      return log.error('Invalid config path.')
    }
    if (cmds.length <= 0) {
      return log.error('Invalid cmd.')
    }
    const cwd = getCwd(config)
    let scriptPath = path.join(cwd, `${HOOK_DIR}/scripts/${cmds[0]}.js`)

    while (!fs.existsSync(scriptPath) && alias.length > 0) {
      scriptPath = path.join(cwd, `${HOOK_DIR}/scripts/${alias.shift()}.js`)
    }
    if (!fs.existsSync(scriptPath)) {
      log.error(`There is no ${cmds[0]} scripts exist.`)
      log.info(`You maybe foget to create a ${cmds[0]}.js in directory ${path.join(cwd, 'scripts/')}.`)
      return renderAscii()
    }

    let script = require(scriptPath)
    let prompts = []
    if (typeof script === 'object') {
      prompts = script.prompts || []
      script = script.action
    }

    if (typeof script !== 'function') {
      log.error(`Invalid ${cmds[0]} script, expect to export a function.`)
      return renderAscii()
    }

    function fn (params) {
      let bindScript = script.bind({
        getConfig: () => getConfig(config),
        getCwd: () => getCwd(config),
        saveConfig: conf => saveConfig(conf, config),
        log,
        renderAscii
      })
      const result = bindScript(params)
      result && log(result)
    }

    if (exec === true) {
      if (prompts.length > 0) {
        Inquirer.prompt(injectPrompt(prompts, {
          cmds,
          argvs
        })).then(anwsers => {
          fn({
            cmds,
            argvs: Object.assign(argvs, anwsers)
          })
        })
      } else {
        return fn({
          cmds,
          argvs
        })
      }
    } else {
      return { action: script, prompts }
    }
  }
}
