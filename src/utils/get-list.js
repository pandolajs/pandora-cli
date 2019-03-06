/**
 * @fileOverview pandora-cli 通过接口获取官方维护的项目脚手架列表
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-26 | sizhao       // 初始版本
*/

const { execSync } = require('child_process')

module.exports = () => {
  let list = []
  try {
    const listJSON = execSync('npm search --json /@pandolajs\/pandora-boilerplate-.+/')
    list = JSON.parse(listJSON)
  } catch(error) {}

  return Promise.resolve(list)
}
