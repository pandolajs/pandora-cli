/**
 * @fileOverview pandolajs-cli 命令行
 * @author sizhao | sizhao@pandolajs.com
 * @version 1.0.0 | 2018-06-12 | sizhao         // 初始版本
 * @version 1.1.0 | 2018-06-12 | sizhao         // 支持自定义 hook
*/


const yargs = require('yargs')
const { DEFAULT_CONF } = require('./utils/constants')
const { loadCmd } = require('./utils/index')

module.exports = (options) => {
  const config = Object.assign({}, {
    config: DEFAULT_CONF
  }, options)
  yargs.config(config)
    .option('config', {
      alias: 'c',
      describe: 'The configuration file path',
      default: config.config
    })
    .command('$0', 'Welcome to pandora-cli.', yargs => {
      yargs.commandDir('./commands')
    }, ({ _: [cmd, ...restCmds], ...argvs }) => {
      // @1.1.0 支持自定义 hook
      if (cmd) {
        return loadCmd({
          cmds: [cmd, ...restCmds],
          argvs
        }, argvs.config)
      }
      yargs.showHelp()
    }).argv
}