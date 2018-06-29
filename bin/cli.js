#!/usr/bin/env node
 
const commander = require('../src/index')
const { DEFAULT_NAME } = require('../src/utils/constants')
const findUp = require('find-up')

const confPath = findUp.sync(DEFAULT_NAME)
const config = {}
if (confPath) {
  config.config = confPath
}

commander(config)