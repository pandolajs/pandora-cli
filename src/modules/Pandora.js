/**
 * @fileOverview Pandora Class
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2019-02-27 | sizhao  // init version
*/

const path = require('path')
const fs = require('fs')
const { SyncHook } = require('tapable')
const findup = require('find-up')

const { DEFAULT_NAME, DEFAULT_CONF } = require('../utils/constants')

class Pandora {
  constructor () {
    this.hooks = {
      build: new SyncHook(['env']),
      start: new SyncHook(),
      release: new SyncHook()
    }

    const configPath = findup.sync([DEFAULT_NAME]) || DEFAULT_CONF

    this.configPath = configPath
    this.root = path.dirname(configPath)
  }

  // return the pandora project root directory
  getRoot () {
    return this.root
  }

  // return the configuration of the current project
  getConfig () {
    const { configPath } = this
    let config = {}

    if (fs.existsSync(configPath)) {
      config = require(configPath)
    } else {
      throw new Error('[Pandora]: Can not find pandora configuration file .pandora.conf.json')
    }

    return config
  }

  // set the configuration to project .pandora.config.json
  setConfig (config) {

  }

  build (env) {
    this.hooks.build.call('env')
  }
}

module.exports = Pandora
