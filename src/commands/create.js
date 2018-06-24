/**
 * @fileOverview pandora-cli create command
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-24 | sizhao       // 初始版本
*/

exports.command = 'create <command>'

exports.desc = 'Create a component or a file though a boilerplate.'

exports.builder = yargs => {
  yargs.commandDir('create_cmds')
}

exports.handler = argvs => {
  console.log('create a file:', argvs)
}