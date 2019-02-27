/**
 * @fileOverview Pandora Class
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2019-02-27 | sizhao  // 初始版本
*/

const { SyncHook } = require('tapable')

class Pandora {
  constructor () {
    this.hooks = {
      build: new SyncHook(['env']),
      start: new SyncHook(),
      release: new SyncHook()
    }
  }

  build (env) {
    this.hooks.build.call('env')
  }
}

module.exports = Pandora
