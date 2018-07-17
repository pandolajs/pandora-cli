/**
 * @fileOverview npm config 映射
 * @author sizhao | 870301137@qq.com
 * @version 1.0.0 | 2018-07-16 | sizhao  // 初始版本
*/

module.exports = {
  s: { loglevel: 'silent' },
  q: { loglevel: 'warn' },
  d: { loglevel: 'info' },
  dd: { loglevel: 'verbose' },
  ddd: { loglevel: 'silly' },
  g: 'global',
  C: 'prefix',
  l: 'long',
  m: 'message',
  p: 'parseable',
  reg: 'registry',
  f: 'force',
  desc: 'description',
  S: 'save',
  P: 'save-prod',
  D: 'save-dev',
  O: 'save-optional',
  B: 'save-bundle',
  E: 'save-exact',
  y: 'yes',
  n: { yes: false }
}