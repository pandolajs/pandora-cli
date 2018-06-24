/**
 * @fileOverview pandolajs-cli 命令行
 * @author sizhao | sizhao@pandolajs.com
 * @version 1.0.0 | 2018-06-12 | sizhao         // 初始版本
*/


const yargs = require('yargs')
const Inquire = require('inquirer')

yargs.command(['*', '$0'], 'Welcome to pandora-cli.', yargs => {
  yargs.commandDir('./commands')
}, args => {
  yargs.help()
})
