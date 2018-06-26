/**
 * @fileOverview pandora-cli start command
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-26 | sizhao       // 初始版本
*/

exports.command = 'start'

exports.aliases = 'build'

exports.desc = 'Start current project.'

exports.builder = {
  
}

exports.handler = argvs => {
  console.log('start a project.')
}