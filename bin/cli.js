#!/usr/bin/env node
 
const defaultConfName = '.pandora.conf.json'
const commander = require('../src/index')
const findUp = require('find-up')

const confPath = findUp.sync(defaultConfName)
const config = {}
if (confPath) {
  config.config = confPath
}

commander(config)