#!/usr/bin/env node
const TimeClient = require('./index')

const params = {
  timeServerUrl: 'ws://localhost:8001',
  maxIterations: 150,
  minPrecision: 5 // ms
}
const timeClient = new TimeClient(params)
timeClient
  .init()
  .onDiff((diff) => {
    console.log('-'.repeat(80))
    console.log('--- TIME DIFF:', diff)
    console.log('-'.repeat(80))
    process.exit()
  })
