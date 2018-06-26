/**
 * @fileOverview 常量
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-26 | sizhao    // 初始版本
*/

const path = require('path')

const DEFAULT_NAME = '.padora.conf.json'
module.exports = {
  DEFAULT_NAME,
  DEFAULT_CONF: path.join(process.cwd(), DEFAULT_NAME)
}