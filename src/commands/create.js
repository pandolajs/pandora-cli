/**
 * @fileOverview pandora-cli create command
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-24 | sizhao       // 初始版本
*/

const Inquirer = require('inquirer')
const { currentDate, getConfig, getGitUser, renderAscii, log, getCwd, template } = require('../utils')
const path = require('path')
const fs = require('fs')

const suffix = '.pandora/templates'
const buildInSuffix = '../resource/templates'

exports.command = 'create'

exports.aliases = 'c'

exports.desc = 'Create a component or a file though a boilerplate.'

exports.builder = {
  author: {
    alias: 'a',
    default: '',
    describe: 'Author name.'
  },
  email: {
    alias: 'e',
    default: '',
    describe: 'Author email.'
  },
  description: {
    alias: 'd',
    default: '',
    describe: 'File description.'
  }
}

exports.handler = async argvs => {
  let { _:[ cmd, fileType, filename ], author, email, description, config } = argvs

  const parentCmd = path.basename(process.argv[1])
  if (fileType === undefined) {
    log.error('You must entry filename or template name.')
    log('Usage', null, false)
    log('', null, false)
    log(`    ${parentCmd} create <template> <filename>`, 'yellow', false)
    log(`    ${parentCmd} create <filename>`, 'yellow', false)
    renderAscii()
    return false
  }

  const cwd = getCwd(config)
  const destCwd = process.cwd()

  const buildInTempPath = path.resolve(__dirname, buildInSuffix)
  const projectTempPath = path.resolve(cwd, suffix)
  const fileReg = /.+(\.\w+)$/

  if (!fileReg.test(fileType) && !fs.existsSync(path.join(projectTempPath, fileType)) && !fs.existsSync(path.join(buildInTempPath, fileType))) {
    log.error('Invalid template.')
    renderAscii()
    return false
  }

  if (!author || !email) {
    let { user = {} } = getConfig(config)
    if (!user.name || !user.email) {
      user = await getGitUser()
    }
    author = user.name
    email = user.email
  }

  const prompts = []

  // 创建文件夹时文件夹名称输入
  filename === undefined && !fileReg.test(fileType) && prompts.push({
    type: 'input',
    name: 'filename',
    message: 'Please enter a name to be created:',
    default: fileType
  })

  // 文件和文件夹覆盖
  prompts.push({
    type: 'confirm',
    name: 'override',
    message: fileReg.test(fileType) ?
      `The file '${fileType}' has exsited, would you want to override it?` :
      `The directory '${filename}/' has exsited and no emtpy, would you want to override it?`,
    default: true,
    when (anwsers) {
      if (fileReg.test(fileType)) {
        return fs.existsSync(path.join(destCwd, fileType))
      }
      const d = path.join(destCwd, filename)
      return fs.existsSync(d) && fs.readdirSync(d).length > 0
    }
  })

  // 输入用户名
  !author && prompts.push({
    type: 'input',
    name: 'author',
    message: 'Please enter a user name:',
    default: '',
    when ({ override = true }) {
      return override 
    }
  })

  // 输入邮箱
  !email && prompts.push({
    type: 'input',
    name: 'email',
    message: 'Please enter a email address:',
    default: '',
    when ({ override = true }) {
      return override
    }
  })

  // 输入描述
  !description && prompts.push({
    type: 'input',
    name: 'description',
    message: 'Please entry description:',
    default: '',
    when ({ override = true }) {
      return override
    }
  })

  Inquirer.prompt(prompts).then(answers => {
    const finalAnwsers = Object.assign({}, {
      author, email, description
    }, answers)

    const { description: fdesc, author: fauthor, email: femail, override } = finalAnwsers

    if (override === false) {
      log('Thanks ~~', null, false)
      return renderAscii()
    }

    const tempObj = {
      Description: fdesc,
      User: fauthor,
      Email: femail,
      Date: currentDate()
    }

    if (filename === undefined && fileReg.test(fileType)) {
      filename = fileType
      const ext = path.extname(filename).replace(/^\./, '')
      const buildInTemp = path.join(buildInTempPath, `${ext}.temp`)
      const projectTemp = path.join(projectTempPath, `${ext}.temp`)

      let content = ''
      if (fs.existsSync(projectTemp)) {
        let tempStr = fs.readFileSync(projectTemp, { encoding: 'utf8' })
        content = template(tempStr, tempObj)
      } else if (fs.existsSync(buildInTemp)) {
        let tempStr = fs.readFileSync(buildInTemp, { encoding: 'utf8' })
        content = template(tempStr, tempObj)
      } 

      const stream = fs.createWriteStream(path.join(destCwd, filename))
      stream.end(content)
      log.success(`${filename} created success.`)
    } else {
      const projTemp = path.join(projectTempPath, fileType)
      const buInTemp = path.join(buildInTempPath, fileType)
      const destTempPath = path.join(destCwd, filename)
      let fileList = []
      let targetTemp = projTemp
      if (fs.existsSync(projTemp)) {
        fileList = fs.readdirSync(projTemp)
      } else {
        targetTemp = buInTemp
        fileList = fs.readdirSync(buInTemp)
      }

      if (!fs.existsSync(destTempPath)) {
        fs.mkdirSync(destTempPath)
      }

      fileList.forEach(file => {
        const content = fs.readFileSync(path.join(targetTemp, file), { encoding: 'utf8' })
        fs.createWriteStream(path.join(destTempPath, file)).end(template(content, tempObj))
      })
      log.success(`The ${fileType} ${filename} created success.`)
    }
  })
}