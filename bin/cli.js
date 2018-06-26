#!/usr/bin/env node
 
const commander = require('../src/index')
const findUp = require('find-up')

const cwd = process.cwd()
console.log('cwd:', cwd)

commander({})