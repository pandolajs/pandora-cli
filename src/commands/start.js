/**
 * @fileOverview pandora-cli start command
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-26 | sizhao       // 初始版本
*/

const path = require('path')
const fs = require('fs')
const { ENV, DEFAULT_ENV } = require('../utils/constants') 
const { getCwd, log, renderAscii } = require('../utils')  

exports.command = 'start'

exports.aliases = 'build'

exports.desc = 'Start current project.'

exports.builder = {
  env: {
    alias: 'e',
    describe: 'Specify the running environment.',
    default: DEFAULT_ENV
  }
}

exports.handler = argvs => {
  log('Start building ...')
  const { config, env } = argvs
  const cwd = getCwd(config)
  const buildScript = path.join(cwd, 'scripts/build.js')
  const scriptExit = fs.existsSync(buildScript)
  if (!scriptExit) {
    log.error('There is no build scripts exist.')
    log(`You maybe foget to create a build.js in directory ${path.join(cwd, 'scripts/')}.`)
    renderAscii()
    return false
  }
  const build = require(buildScript)
  if (typeof build !== 'function') {
    log.error('Invalid build script, expect to export a function.')
    renderAscii()
    return false
  }
  const result = build(ENV[env.toLowerCase()])
  result && log(result)
}