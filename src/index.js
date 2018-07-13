/**
 * @fileOverview pandolajs-cli 命令行
 * @author sizhao | sizhao@pandolajs.com
 * @version 1.0.0 | 2018-06-12 | sizhao         // 初始版本
 * @version 1.1.0 | 2018-06-12 | sizhao         // 支持自定义 hook
 * @version 1.2.0 | 2018-06-13 | sizhao         // 重新定义自定 hook 到处格式, 详见 description
 * @description
 * 自定义 hook 根式如下：
 * - 直接导出函数
 * module.exports = ({ cmds, argvs }) => {
 *   this.log()                       // 日志输出，支持 info, error, success, table
 *   this.log.info('Hello world.')
 *   this.getCwd()                    // 获取项目的根目录
 *   this.getConfig()                 // 获取项目根目录下 .pandora.conf.json 的配置
 *   this.saveConfig({ name: 't' })   // 向项目根目录的 .pandora.conf.json 添加配置
 *   this.renderAscii()               // 输出 Pandolajs 字符图片
 * }
 * 
 * - 导出对象，支持自定义问答输入
 * module.exports = {
 *   prompts: [
 *     {...}  详见 https://www.npmjs.com/package/inquirer#question
 *   ],
 *   actions ({ cmds, argvs }) => {
 *     // 使用同上描述
 *   }
 * }
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
        }, argvs.config, true)
      }
      yargs.showHelp()
    }).argv
}