/**
 * @fileOverview pandora-cli upgrade command
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-27 | sizhao       // 初始版本
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

exports.command = 'upgrade'

exports.aliases = 'u'

exports.desc = 'Upgrade the scripts and templates.'

exports.builder = yargs => {
  yargs.options({
    scripts: {
      alias: 's',
      describe: 'Force to reset the project custom scripts to boilerplate scripts.',
      default: false
    }
  }).boolean('scripts')
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
        log(`copy file ${filename}`)
        fs.copyFileSync(fp, tp)
      }
    })
  } catch (error) {
    log.error('Upgrade failed.')
    return renderAscii()
  }
}

exports.handler = async argvs => {
  const { config, scripts } = argvs
  const confObj = getConfig(config)
  const { boilerplate: { name: boilerplate, version } = {} } = confObj
  if (!boilerplate) {
    log.error(`Invalid '${DEFAULT_NAME}': ${config}`)
    return renderAscii()
  }

  const cwd = getCwd(config)
  const cachePath = path.join(cwd, CACHE_DIR)
  const boilerplatePath = path.join(cachePath, boilerplate)
  const buildinSouTempPath = path.join(boilerplatePath, HOOK_DIR, 'templates')
  const buildinSouScriptPath = path.join(boilerplatePath, HOOK_DIR, 'scripts')
  const customSouScriptPath = path.join(boilerplatePath, 'scripts')
  const buildinTarTempPath = path.join(cwd, HOOK_DIR, 'templates')
  const buildinTarScriptPath = path.join(cwd, HOOK_DIR, 'scripts')
  const customTarScriptPath = path.join(cwd, 'scripts')

  const metadata = await pkg(boilerplate)
  const { version: remoteVersion } = metadata
  if (!versionCompare(remoteVersion, version)) {
    log.info(`Local boilerplate ${boilerplate} is already up to date.`)
    return renderAscii()
  } else {
    log.info(`Local boilerplate version is ${version}, avaliable remote version is ${remoteVersion}.`)
    log('Stat upgrading ...')
  }

  // 升级
  function upgrade (version) {
    copyDir(buildinSouTempPath, buildinTarTempPath, cwd)
    copyDir(buildinSouScriptPath, buildinTarScriptPath, cwd)
    scripts && copyDir(customSouScriptPath, customTarScriptPath, cwd)
    saveConfig({
      boilerplate: {
        version: remoteVersion
      }
    }, config)
    log.success(`${boilerplate} has upgrade to ${version}.`)
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