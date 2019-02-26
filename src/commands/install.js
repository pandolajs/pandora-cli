/**
 * @fileOverview pandora-cli install command
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-27 | sizhao       // 初始版本
 * @version 1.1.0 | 2018-07-10 | sizhao       // pa i --npm 来安装 npm 包，或者非小程序项目中默认安装 npm 包
 *                                            // 支持通过配置制定小程序的组件库包
 * @version 1.2.0 | 2018-07-19 | sizhao       // 支持同时安装多个组件
 * @description
 * 1. 在小程序项目中，pa install component 默认将安装官方维护的组件库中对应的组件
 * 2. 支持通过配置制定额外的小程序组件库，优先从配置的组件库中下载组件
 * 3. 通过 --npm 可以在小程序项目中通过 pa install 来安装 npm 包, 支持 npm i 的所有参数
 * 4. 非小程序项目中 pa install 默认安装 npm 包，支持 npm i 的所有参数
 * 5. 通过 keywords 中是否包含 ’miniprogram‘ 来判断是否为小程序脚手架
*/

const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const pkg = require('package-json')
const got = require('got')
const tar = require('tar')
const showProgress = require('crimson-progressbar')
const del = require('del')
const npmi = require('npmi')
const ora = require('ora')

const npmConf = require('../utils/npmConf')
const { log, getConfig, getCwd, renderAscii, mkdirs } = require('../utils')
const { CACHE_DIR } = require('../utils/constants')

exports.command = 'install'

exports.aliases = 'i'

exports.desc = 'Install wechat miniprogram custom components.'

exports.builder = yargs => {
  yargs.options({
    dest: {
      describe: 'Specify the destination directory where install the compoents.',
      default: 'src/components'
    },
    nocache: {
      describe: 'Install the component with no cache.',
      default: false
    },
    npm: {
      describe: 'Force install component from npm registy,',
      default: false
    }
  }).boolean(['nocache', 'npm']).argv
}

const componentRegisty = '@pandolajs/pandora-ui-wechat'

// 复制组件
function copyComponent(from, to, version, cwd, registryName = componentRegisty) {
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
    copyComponent(dependency, path.resolve(to, cp), version, cwd, registryName)
  })
  log.success(`+ ${registryName}/${path.basename(from)}@${version}`)
}

// npm conf map
function npmConfig (npmOption = {}) {
  let result = {}
  Object.keys(npmOption).forEach(key => {
    if (npmOption.hasOwnProperty(key)) {
      if (npmConf.hasOwnProperty(key)) {
        const targetKey = npmConf[key]
        if (typeof targetKey === 'string') {
          result[targetKey] = npmOption[key]
        } else if (typeof targetKey === 'object') {
          result = Object.assign(result, targetKey)
        }
      } else {
        result[key] = npmOption[key]
      }
    }
  })
  return result
}

// download miniprogram component registry.
async function downloadRegistry (registries, config) {
  const cwd = getCwd(config)
  const cachePath = path.join(cwd, CACHE_DIR)
  const promises = []

  registries.forEach(registry => {
    const { name } = registry
    const registryPath = path.join(cachePath, name)

    if (!fs.existsSync(registryPath)) {
      mkdirs(registryPath, path.dirname(cachePath))
      const promise = pkg(name, { fullMetadata: true }).then(async metadata => {
        const { dist: { tarball } } = metadata
        log(`\nStart downloading ${tarball}`)
        const stream = await got.stream(tarball)
          .on('downloadProgress', ({ percent }) => {
            showProgress.renderProgressBar(Math.ceil(100 * percent), 100, "green", "red", "▓", "░", false)
          })

        return new Promise((resolve, reject) => {
          stream.pipe(tar.x({
            strip: 1,
            C: registryPath
          })).on('close', () => {
            resolve()
          }).on('error', () => {
            reject()
          })
        })
      })
      promises.push(promise)
    }
  })
  return Promise.all(promises)
}

exports.handler = argvs => {
  const spinner = ora()
  spinner.start('installing ...')

  const { _: [cmd, component], config, nocache, dest, npm, version, ...npmOptions } = argvs
  const { boilerplate: { keywords = [] } = {}, components = [] } = getConfig(config)

  let parentCmd = path.basename(process.argv[1])
  if (keywords.includes('miniprogram') && !npm && component === undefined) {
    spinner.fail('install failed.')
    log.error('You must specify a component name that you want to install.')
    log.line()
    log('Usage', null, false)
    log(`    ${parentCmd} ${cmd} <component>`, null, false)
    return renderAscii()
  }

  if (!keywords.includes('miniprogram') || npm ) {
    spinner.stop()
    const [ npmPkg, version = 'latest' ] = (component || '').split('@')
    return npmi({
      name: npmPkg,
      version,
      npmLoad: Object.assign({
        save: true
      }, npmConfig(npmOptions))
    }, ( error ) => {
      if (error) {
        return log.error(`install ${npmPkg} error.`)
      }
      return npmPkg ? log.success(`+ ${npmPkg}@${version}`) : ''
    })
  }

  const cwd = getCwd(config)
  const cachePath = path.join(cwd, CACHE_DIR)

  if (nocache) {
    spinner.stop()
    log('Start cleaning cache ...')
    del.sync([cachePath])
    log('Finish cleaning cache.')
  }

  spinner.stop()
  log(`Start install component ${component} ...`)
  const registries = [...components]
  if (!registries.some(({ name }) => {
    return name === componentRegisty
  })) {
    registries.push({
      name: componentRegisty
    })
  }
  downloadRegistry(registries, config).then(() => {
    let installed = false
    function it () {
      return registries.shift() || {}
    }
    log.line()

    do {
      let { name, path: p, dependencies = [] } = it()
      const registryPath = path.join(cachePath, name)
      const { main, version } = require(path.join(registryPath, 'package.json'))
      if (!p) {
        p = main
      }
      const componentPath = path.join(registryPath, p, component)
      if (fs.existsSync(componentPath)) {
        copyComponent(componentPath, path.join(cwd, dest, component), version, cwd, name)

        // 非通过 usingComponents 申明的依赖，通过 components.dependencies: [] 来申明
        dependencies.forEach((item) => {
          const depenPathFrom = path.join(registryPath, p, item)
          const depenPathTo = path.join(cwd, dest, item)

          try {
            fse.copySync(depenPathFrom, depenPathTo)
          } catch(error){
            log.error(`Install ${name}/${p}/${item} failed.`)
            console.error(error)
          }
        })
        installed = true
      }

    } while (registries.length && !installed)

    if (!installed) {
      log.error('Invalid component name.')
      renderAscii()
    }
  }).catch((error) => {
    log.info(`Install component ${component} fail.`)
    log.info(`You can try cmd: '${parentCmd} install ${component} --no-cache' to fix it.`)
    console.error(error)
    renderAscii()
  })
}
