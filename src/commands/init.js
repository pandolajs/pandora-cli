/**
 * @fileOverview pandora-cli init command
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-26 | sizhao       // 初始版本
*/

exports.command = 'init'

exports.desc = 'Initial a project with a boilerplate.'

exports.builder = {}

exports.handler = argvs => {
  console.log('init a project.')
}