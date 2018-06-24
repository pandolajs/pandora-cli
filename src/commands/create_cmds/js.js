/**
 * @fileOverview 生成 js 文件
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-24 | sizhao    // 初始版本
*/

const { spawn } = require('child_process')

const jsTemplate = `
/**
 * @fileOverview {desc}
 * @author {author} | {email}
 * @version 1.0.0 | {date} | {author}    // 初始版本
*/
`

exports.command = 'js <filename> [author] [email] [desc]'

exports.desc = 'js file'

exports.builder = {
  // 文件名
  filename: {
    alias: 'f',
    default: 'index.js'
  },
  // 作者
  author: {
    alias: 'a',
    default: 'pandora-cli'
  },
  // email
  email: {
    alias: 'e',
    default: ''
  },
  // 文件描述
  desc: {
    alias: 'd',
    default: 'create by pandora-cli'
  }
}

exports.handler = async (argvs) => {
  const cwd = process.cwd()
  const user = await new Promise((resolve, reject) => {
    
    const gitconf = spawn('git', ['config'])
  }).then(data => {

  }).catch(error => {

  })
}