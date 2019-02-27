/**
 * @fileOverview pandora-cli start command
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-26 | sizhao       // 初始版本
*/

const { DEFAULT_ENV } = require('../utils/constants')
const { log, loadCmd } = require('../utils')

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

exports.handler = ({ _: cmds = [], ...argvs }) => {
  log('Start building ...')
  pandora.hooks.build.tap('react-build', (env) => {
    console.log('react-build', env)
  })
  pandora.build('dev')
  return
  loadCmd({
    cmds,
    argvs,
    alias: ['build', 'start']
  }, argvs.config, true)
}
