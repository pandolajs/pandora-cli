/**
 * @fileOverview pandora-cli init command
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-26 | sizhao       // 初始版本
*/

const Inquire = require('inquirer')
const getList = require('../utils/get-list')
const { log } = require('../utils')

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

exports.handler = async argvs => {
  const { boilerplate, _: [cmd, name], author, email, config } = argvs
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
  if (!boilerplate) {
    const list = await getList().catch(({ message = 'Get boilerplates failed.' }) => {
      log.error(message)
    })
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

  // 最终处理
  Inquire.prompt(prompts).then(anwsers => {
    const finalAnwsers = Object.assign({}, {
      boilerplate, name, author, email
    }, anwsers)
    console.log('anwsers:', finalAnwsers)
  })
}