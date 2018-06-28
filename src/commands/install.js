/**
 * @fileOverview pandora-cli install command
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-27 | sizhao       // 初始版本
 * @description 
 * 1. 该命令只针对微信小程序项目有效，用来安装微信自定义组件
 * 2. 其他类型项目将不做任何处理
*/

const { log, getConfig, getCwd, renderAscii } = require('../utils')
const { CACHE_DIR } = require('../utils/constants')
const path = require('path')
const fs = require('fs')
const pkg = require('package-json')
const got = require('got')
const tar = require('tar')
const showProgress = require('crimson-progressbar')

exports.command = 'install'

exports.aliases = 'i'

exports.desc = 'Install wechat miniprogram custom components.'

exports.builder = {
  dest: {
    alias: 'd',
    describe: 'Specify the destination directory where install the compoents.',
    default: 'src/components'
  },
  "no-cache": {
    alias: 'nc',
    describe: 'Install the component with no cache.',
    default: false
  }
}

// 复制组件
function copyComponent(from, to) {
  !fs.existsSync(to) && fs.mkdirSync(to)
  const files = fs.readdirSync(from)
  let json = ''
  files.forEach(file => {
    let f = path.join(from, file)
    let t = path.join(to, file)
    if (/\.json$/.test(file)) {
      json = f
    }
    fs.copyFileSync(f, t)
  })
  const { usingComponents = {} } = require(json)
  Object.keys(usingComponents).forEach(key => {
    const p = usingComponents[key]
    const cp = path.dirname(p)
    copyComponent(path.resolve(from, cp), path.resolve(to, cp))
  })
}

const boilName = '@pandolajs/pandora-boilerplate-wechat'
const componentRegisty = '@pandolajs/pandora-ui-wechat'
exports.handler = argvs => {
  const { _: [cmd, component], config, nc, dest } = argvs
  const { boilerplate: { name } = {} } = getConfig(config)

  if (name !== boilName) {
    log.error(`The ${cmd} command is only work in ${boilName} project.`)
    return renderAscii()
  }

  const cwd = getCwd(config)
  const cachePath = path.join(cwd, CACHE_DIR)
  const registyPath = path.join(cachePath, componentRegisty)

  if (!fs.existsSync(registyPath)) {
    !fs.existsSync(cachePath) && fs.mkdirSync(cachePath)
    !fs.existsSync(path.dirname(registyPath)) && fs.mkdirSync(path.dirname(registyPath))
    fs.mkdirSync(registyPath)
  }
  pkg(componentRegisty, { fullMetadata: true }).then(async metadata => {
    console.log('metadata:', metadata)
    const { dist: { tarball }, main } = metadata
    log(`Starting download ${tarball}`)
    const stream = await got.stream(tarball)
      .on('downloadProgress', ({ percent }) => {
        showProgress.renderProgressBar(Math.ceil(100 * percent), 100, "green", "red", "▓", "░", false)
      })
    stream.pipe(tar.x({
      strip: 1,
      C: registyPath
    })).on('close', () => {
      const componentPath = path.join(registyPath, main, component)
      console.log('component:', componentPath)
      if (fs.existsSync(componentPath) && fs.readdirSync(componentPath).length > 0) {
        copyComponent(componentPath, path.join(cwd, dest, component))
      } else {
        log('', null, false)
        log.error('Invalid component name.')
        return renderAscii()
      }
    })
  })
}