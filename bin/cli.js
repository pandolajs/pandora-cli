#!/usr/bin/env node

const findUp = require('find-up')

const commander = require('../src/index')
const { DEFAULT_NAME } = require('../src/utils/constants')
const Pandora = require('../src/modules/Pandora')

global.pandora = new Pandora()

const confPath = findUp.sync(DEFAULT_NAME)
const config = {}
if (confPath) {
  config.config = confPath
}

commander(config)
