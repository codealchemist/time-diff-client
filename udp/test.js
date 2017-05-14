#!/usr/bin/env node
const TimeClient = require('./index')

const timeClient = new TimeClient()
timeClient
  .init()
  .onDiff((diff) => {
    console.log('-'.repeat(80))
    console.log('--- TIME DIFF:', diff)
    console.log('-'.repeat(80))
    process.exit()
  })
