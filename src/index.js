/**
 * @fileOverview pandolajs-cli 命令行
 * @author sizhao | sizhao@pandolajs.com
 * @version 1.0.0 | 2018-06-12 | sizhao         // 初始版本
*/


const yargs = require('yargs')
const { DEFAULT_CONF } = require('./utils/constants')

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
    }, () => {
      yargs.showHelp()
    }).argv
}