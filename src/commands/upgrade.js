/**
 * @fileOverview pandora-cli upgrade command
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-27 | sizhao       // 初始版本
 * @version 1.1.0 | 2018-07-31 | sizhao       // 更新 upgrade 命令
 *                                            // 1. 支持通过 -b, --boilerplate 参数初始化某个项目为制定项目
 *                                            // 2. 支持 --scripts 参数时，深度 merge package.json
 *                                            // 3. 支持 --force 参数，非 --force 时，major upgrade 升级提示
 * @description
 * 1. 用来升级项目中所使用脚手架的 scripts 和 .pandora
 * 2. 更新 .pandora.conf.json 中脚手架的版本号
*/

const { log, getConfig, getCwd, renderAscii, versionCompare, mkdirs, saveConfig } = require('../utils')
const { DEFAULT_NAME, CACHE_DIR, HOOK_DIR } = require('../utils/constants')
const pkg = require('package-json')
const path = require('path')
const fs = require('fs')
const got = require('got')
const tar = require('tar')
const del = require('del')
const showProgress = require('crimson-progressbar')
const deepExtend = require('deep-extend')

exports.command = 'upgrade'

exports.aliases = 'u'

exports.desc = 'Upgrade the scripts and templates.'

exports.builder = yargs => {
  yargs.options({
    scripts: {
      alias: 's',
      describe: 'Force to reset the project custom scripts to boilerplate scripts.',
      default: false
    },
    force: {
      descripbe: 'Force upgrade ignore broken change.',
      default: false
    },
    boilerplate: {
      alias: 'b',
      descripbe: 'Specify the boilerplate that want to init/upgrade.',
      default: ''
    }
  }).boolean(['scripts', 'force'])
}

// 复制文件
function copyDir (from, to, cwd) {
  try {
    !fs.existsSync(to) && mkdirs(to, cwd)
    const files = fs.readdirSync(from)
    files.forEach(filename => {
      const fp = path.join(from, filename)
      const tp = path.join(to, filename)
      if (fs.statSync(fp).isDirectory()) {
        copyDir(fp, tp, cwd)
      } else {
        log(`copy file ${tp.replace(cwd + '/', '')}`)
        fs.copyFileSync(fp, tp)
      }
    })
  } catch (error) {
    log.error('Upgrade failed.')
    return renderAscii()
  }
}

exports.handler = async argvs => {
  const { config, scripts, force, b } = argvs
  const confObj = getConfig(config)
  const isPandoraProject = !!Object.keys(confObj).length
  let { boilerplate: { name: boilerplate = b, version } = {} } = confObj

  // 非 pandora 项目，且未指定 -b 参数
  if (!isPandoraProject && !boilerplate) {
    log.info(`This is not a pandora project. \n You may execute the command 'pa upgrade -b <boilplate-name>' to turn current project to pandora project.`)
    return renderAscii()
  }

  // 当制定 -b 或者 --boilerplate 时，则表示在初始化一个非 pandora 项目，此时需要先初始化 .pandora.conf.json
  !isPandoraProject && await saveConfig({
    boilerplate: {
      name: boilerplate
    }
  }, config)

  if (!boilerplate) {
    log.error(`Invalid '${DEFAULT_NAME}': ${config}`)
    return renderAscii()
  }

  const cwd = getCwd(config)
  const cachePath = path.join(cwd, CACHE_DIR)
  const boilerplatePath = path.join(cachePath, boilerplate)
  const buildinSouTempPath = path.join(boilerplatePath, HOOK_DIR, 'templates')
  const buildinSouScriptPath = path.join(boilerplatePath, HOOK_DIR, 'scripts')
  const buildinPkgPath = path.join(boilerplatePath, 'package.json')
  const buildinPandoraConfPath = path.join(boilerplatePath, '.pandora.conf.json')
  const customSouScriptPath = path.join(boilerplatePath, 'scripts')
  const buildinTarTempPath = path.join(cwd, HOOK_DIR, 'templates')
  const buildinTarScriptPath = path.join(cwd, HOOK_DIR, 'scripts')
  const customTarScriptPath = path.join(cwd, 'scripts')

  const metadata = await pkg(boilerplate)
  const { version: remoteVersion } = metadata

  // 非 pandora 项目不进行版本判断, 项目版本直接使用远程库 版本
  if (isPandoraProject) {
    const compare = versionCompare(remoteVersion, version)
    if (!compare.upgrade) {
      log.info(`Local boilerplate ${boilerplate} is already up to date.`)
      return renderAscii()
    } else {
      const { semver = '' } = compare
      if (semver === 'major' && !force) {
        log.info(`Local boilerplate version is ${version}, the avaliable remote version is ${remoteVersion}. \n There are maybe some broken changes, please figure it out. \n You can upgrade force use command below: \n 'pa upgrade --force'`)
        return renderAscii()
      }
      log.info(`Local boilerplate version is ${version}, the avaliable remote version is ${remoteVersion}.`)
      log('Stat upgrading ...')
    }
  } else {
    version = remoteVersion
  }

  // 升级
  function upgrade (version) {
    copyDir(buildinSouTempPath, buildinTarTempPath, cwd)
    copyDir(buildinSouScriptPath, buildinTarScriptPath, cwd)

    const remotePkg = require(buildinPkgPath)
    if (scripts) {
      copyDir(customSouScriptPath, customTarScriptPath, cwd)
      // deep merge package.json scripts field
      const curPkgPath = path.join(cwd, 'package.json')
      const curPkg = require(curPkgPath)
      fs.createWriteStream(curPkgPath).end(JSON.stringify(deepExtend({}, curPkg, {
        scripts: remotePkg.scripts
      }), null, '  '))
    }

    const upgradeConf = {
      boilerplate: {
        version
      }
    }

    if (!isPandoraProject) {
      upgradeConf.boilerplate.keywords = remotePkg.keywords
    }

    saveConfig(deepExtend(upgradeConf, require(buildinPandoraConfPath)), config)
    log.success(isPandoraProject ? `${boilerplate} has upgrade to ${version}.` : `Current project has upgrade to pandora project, the boilerplate is ${boilerplate}@${version}`)
    renderAscii()
  }

  if (fs.existsSync(boilerplatePath)) {
    log('Clean boilerplate cache...')
    del.sync([boilerplatePath])
    log('Clean boilerplate cache finished.')
  }

  mkdirs(boilerplatePath, cwd)
  const { dist: { tarball } } = metadata
  log(`Start downloading ${tarball}`)
  const stream = await got.stream(tarball)
    .on('downloadProgress', ({ percent }) => {
      showProgress.renderProgressBar(Math.ceil(100 * percent), 100, "green", "red", "▓", "░", false)
    })
  stream.pipe(tar.x({
    strip: 1,
    C: boilerplatePath
  })).on('close', () => {
    log('', null, false)
    upgrade(remoteVersion)
  })
}
