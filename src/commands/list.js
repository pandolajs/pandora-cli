/**
 * @fileOverview pandora-cli list command
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-06-26 | sizhao       // 初始版本
*/

const getList = require('../utils/get-list')
const { log } = require('../utils')

exports.command = 'list'

exports.aliases = ['ls']

exports.desc = 'List all available boilerplates that is used to init a project.'

exports.builder = {}

exports.handler = async () => {
  log('All official boilerplates:', 'greenBright', false)
  log('', null, false)
  log('Usage', null, false)
  log('', null, false)
  log('pa init -b <boilerplate>', 'yellowBright', false)
  log('', null, false)
  const list = await getList().catch(error => {
    const { message = 'Get boilerplates failed!' } = error
    log.error(message)
  })
  log.table(list)
}