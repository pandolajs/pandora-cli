/**
 * @fileOverview pandora-cli install command
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-27 | sizhao       // 初始版本
 * @description 
 * 1. 该命令只针对微信小程序项目有效，用来安装微信自定义组件
 * 2. 其他类型项目将不做任何处理
*/

exports.command = 'install'

exports.aliases = 'i'

exports.desc = 'Install wechat miniprogram custom components.'

exports.builder = {
  dest: {
    alias: 'd',
    describe: 'Specify the destination directory where install the compoents.',
    default: 'src/components'
  }
}