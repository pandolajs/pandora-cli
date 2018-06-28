/**
 * @fileOverview pandora-cli upgrade command
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-27 | sizhao       // 初始版本
 * @description 
 * 1. 用来升级项目中所使用脚手架的 scripts 和 .pandora
 * 2. 更新 .pandora.conf.json 中脚手架的版本号
*/

exports.command = 'upgrade'

exports.aliases = 'update'

exports.desc = 'Upgrade the scripts and templates.'

exports.builder = {
  'no-scripts': {
    alias: 'ns',
    describe: 'Do not upgrade the project scripts.',
    default: false
  },
  'no-templates': {
    alias: 'nt',
    describe: 'Do not upgrade the project template.',
    default: false
  }
}

exports.handler = argvs => {

}