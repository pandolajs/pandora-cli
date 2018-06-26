/**
 * @fileOverview pandora-cli 通过接口获取官方维护的项目脚手架列表
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-26 | sizhao       // 初始版本
*/

const fetch = require('node-fetch')

const api = 'https://api.npms.io/v2/search?q=scope:pandolajs+keywords:pandora-boilerplate'

module.exports = () => {
  return fetch(api, { method: 'GET' }).then(response => {
    const { status } = response
    return status !== 200 ? Promise.reject(new Error('Get boilerplates failed.')) : response.json()
  }).then(data => {
    const { results = [] } = data
    return results.map(pkg => {
      const { package: { name, description, version } } = pkg
      return {
        name,
        description,
        version
      }
    })
  })
}