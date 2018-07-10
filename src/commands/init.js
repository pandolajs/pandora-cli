/**
 * @fileOverview pandora-cli init command
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-26 | sizhao       // 初始版本
*/

const Inquire = require('inquirer')
const getList = require('../utils/get-list')
const path = require('path')
const fs = require('fs')
const pkg = require('package-json')
const got = require('got')
const tar = require('tar')
const npmi = require('npmi')
const showProgress = require('crimson-progressbar')
const deepExtend = require('deep-extend')
const { DEFAULT_NAME } = require('../utils/constants')
const { log, getConfig, getGitUser, saveConfig, mkdir, renderAscii, template, readFiles, currentDate } = require('../utils')

exports.command = 'init'

exports.desc = 'Initial a project with a boilerplate.'

exports.builder = {
  'boilerplate': {
    alias: 'b',
    describe: 'Specifiy the project boilerplate.'
  },
  'author': {
    alias: 'a',
    describe: 'Input the user name.',
    default: ''
  },
  'email': {
    alias: 'e',
    describe: 'Input the user email.',
    default: ''
  }
}

function initProject (proPath, inject) {
  const pkgPath = path.join(proPath, 'package.json')
  const pkgObj = require(pkgPath)
  fs.createWriteStream(pkgPath).end(JSON.stringify(deepExtend({}, pkgObj, {
    name: inject.ProjectName,
    version: '1.0.0',
    private: true
  }), null, '  '))
  readFiles(proPath, {ignore: ['.{pandora,git,idea,vscode,DS_Store}/**/*', '{scripts,dist,node_modules}/**/*'], gitignore: true}, ({ path, content }) => {
    fs.createWriteStream(path).end(template(content, inject))
  })
}

exports.handler = async argvs => {
  let { boilerplate, _: [cmd, name], author, email, config } = argvs
  const cwd = process.cwd()

  if (!author || !email) {
    let { user = {} } = await getConfig(config)
    if (!user.name || !user.email) {
      user = await getGitUser()
    }
    author = user.name
    email = user.email
  }

  const prompts = []
  // 项目名输入
  !name && prompts.push({
    type: 'input',
    name: 'name',
    message: 'Please enter a project name:',
    validate: input => {
      if (!input) {
        return 'You must enter a project name'
      }
      return true
    }
  })

  // 选择模板
  const list = await getList().catch(({ message = 'Get boilerplates failed.' }) => {
    log.error(message)
  })
  if (!boilerplate) {
    const choices = list.map(item => {
      const { name } = item
      return name
    })

    prompts.push({
      type: 'list',
      name: 'boilerplate',
      message: 'Please select a boilerplate that you want to use:',
      choices
    })
  }

  // 如果选择的 boilerplate 是微信小程序，则输入 appId
  prompts.push({
    type: 'input',
    name: 'appId',
    message: 'Please enter a appId:',
    validate (input) {
      if (!input) {
        return 'You must enter a valid miniprogram appId.'
      }
      return true
    },
    when (anwsers) {
      const { boilerplate = '' } = anwsers
      return /pandora-boilerplate-wechat/i.test(boilerplate)
    }
  })

  // 输入用户名
  !author && prompts.push({
    type: 'input',
    name: 'author',
    message: 'Please enter a user name:',
    default: ''
  })

  // 输入邮箱
  !email && prompts.push({
    type: 'input',
    name: 'email',
    message: 'Please enter a email address:',
    default: ''
  })

  // 非空文件夹提问
  prompts.push({
    type: 'confirm',
    name: 'overWrite',
    message: `The project directory is not empty, would you want to overwrite it?`,
    default: true,
    when (anwsers) {
      const boil = anwsers.name || name
      const prodir = `${path.join(cwd, boil)}/`
      const exist = fs.existsSync(prodir)
      if (exist) {
        const files = fs.readdirSync(prodir)
        return files.length > 0
      } else {
        return false
      }
    }
  })

  // 最终处理
  Inquire.prompt(prompts).then(anwsers => {
    const finalAnwsers = Object.assign({}, {
      boilerplate, name, author, email
    }, anwsers)
    
    const { overWrite, name: projectName, boilerplate: boil, author: userName, email: userEmail, appId } = finalAnwsers
    const curBoil = list.filter(item => {
      return item.name === boil
    })

    // 如果输入的脚手架名称不对，退出命令行
    if (curBoil.length <= 0) {
      log.error(`Invalid boilerplate '${boilerplate}'`)
      renderAscii()
      return false
    }

    const proPath = path.join(cwd, projectName)
    if (overWrite === false) {
      log('Thanks ~~~')
      renderAscii()
      return false
    } else if (overWrite === undefined) {
      mkdir(proPath)
    }

    const configObj = {
      boilerplate: {
        name: boil,
        version: curBoil[0].version
      },
      user: {
        name: userName,
        email: userEmail
      }
    }
    saveConfig(configObj, path.join(proPath, DEFAULT_NAME))

    // 下载脚手架
    pkg(boil).then(async metadata => {
      const { dist: { tarball } } = metadata
      log(`Starting download ${tarball}`)
      const stream = await got.stream(tarball)
        .on('downloadProgress', ({ percent }) => {
          showProgress.renderProgressBar(Math.ceil(100 * percent), 100, "green", "red", "▓", "░", false)
        })
      
      stream.pipe(tar.x({
        strip: 1,
        C: proPath
      })).on('close', () => {
        const ignoreStream = fs.createWriteStream(path.join(proPath, '.gitignore'))
        log.line(2)
        log.info('Start install npm packages ...')
        ignoreStream.on('close', () => {
          initProject(proPath, {
            AppId: appId,
            ProjectName: path.basename(proPath),
            User: userName,
            Email: userEmail,
            Date: currentDate()
          })

          fs.existsSync(path.join(proPath, 'package.json')) && npmi({
            path: proPath,
            localInstall: true
          }, (error, result) => {
            if (error) {
              return console.error(error)
            }
            log.success(`Successed install ${result.length} npm packages.`)
            log('', null, false)
            log('', null, false)
            log.success('Project finish init. Enjoy youself!')
            renderAscii()
          })
        })
        ignoreStream.end(`.DS_Store\n.idea\nbuild\ncoverage\nnode_modules\nnpm-debug.log\nyarn-error.log\n.vscode\nyarn.lock\ndist`)
      })
    })
  })
}