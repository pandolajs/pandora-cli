/**
 * @fileOverview pandora-cli install command
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-27 | sizhao       // 初始版本
 * @description 
 * 1. 该命令只针对微信小程序项目有效，用来安装微信自定义组件
 * 2. 其他类型项目将不做任何处理
*/

const { log, getConfig, getCwd, renderAscii, mkdirs } = require('../utils')
const { CACHE_DIR } = require('../utils/constants')
const path = require('path')
const fs = require('fs')
const pkg = require('package-json')
const got = require('got')
const tar = require('tar')
const showProgress = require('crimson-progressbar')
const del = require('del')

exports.command = 'install'

exports.aliases = 'i'

exports.desc = 'Install wechat miniprogram custom components.'

exports.builder = yargs => {
  yargs.options({
    dest: {
      alias: 'd',
      describe: 'Specify the destination directory where install the compoents.',
      default: 'src/components'
    },
    nocache: {
      alias: 'n',
      describe: 'Install the component with no cache.',
      default: false
    }
  }).boolean('nocache').argv
} 

const boilName = '@pandolajs/pandora-boilerplate-wechat'
const componentRegisty = '@pandolajs/pandora-ui-wechat'

// 复制组件
function copyComponent(from, to, version, cwd) {
  !fs.existsSync(to) && mkdirs(to, cwd)
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
    const dependency = path.resolve(from, cp)
    copyComponent(dependency, path.resolve(to, cp), version, cwd)
  })
  log.success(`+ ${componentRegisty}/${path.basename(from)}@${version}`)
}

exports.handler = argvs => {
  const { _: [cmd, component], config, nocache, dest } = argvs
  const { boilerplate: { name } = {} } = getConfig(config)

  if (name !== boilName) {
    log.error(`The ${cmd} command is only work in ${boilName} project.`)
    return renderAscii()
  }

  let parentCmd = path.basename(process.argv[1])
  if (component === undefined) {
    log.error('You must specify a component name that you want to install.')
    log('', null, false)
    log('Usage', null, false)
    log(`    ${parentCmd} ${cmd} <component>`)
    return renderAscii()
  }

  log(`Start install component ${component} ...`)
  const cwd = getCwd(config)
  const cachePath = path.join(cwd, CACHE_DIR)
  const registyPath = path.join(cachePath, componentRegisty)
  const componentPkg = path.join(registyPath, 'package.json')

  // 如果未使用 flag --no-cache 
  if (!nocache && fs.existsSync(componentPkg)) {
    const { main, version } = require(componentPkg)
    if (main) {
      const componentPath = path.join(registyPath, main, component)
      try {
        log('Install from cache ...')
        copyComponent(componentPath, path.join(cwd, dest, component), version, cwd)
        return true
      } catch(error) {
        console.log(error)
        log.error('Invalide cache.')
        log(`You may run cmd: '${parentCmd} install ${component} --no-cache' to fix it.`)
        return renderAscii()
      }
    }
  }

  if (nocache) {
    log('Start cleaning cache ...')
    del.sync([cachePath])
    log('Finish cleaning cache.')
  }

  !fs.existsSync(registyPath) && mkdirs(registyPath, path.dirname(cachePath))

  pkg(componentRegisty, { fullMetadata: true }).then(async metadata => {
    const { dist: { tarball }, main, version } = metadata
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
      if (fs.existsSync(componentPath) && fs.readdirSync(componentPath).length > 0) {
        log('', null, false)
        copyComponent(componentPath, path.join(cwd, dest, component), version, cwd)
      } else {
        log('', null, false)
        log.error('Invalid component name.')
        return renderAscii()
      }
    })
  })
}