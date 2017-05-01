const TimeClient = require('./index')

const serverUrl = 'ws://192.168.0.120:8080'
const timeClient = new TimeClient(serverUrl)
timeClient
  .init()
  .onDiff((diff) => {
    console.log('-'.repeat(80))
    console.log('--- GOT CLOCKS DIFF:', diff)
    console.log('-'.repeat(80))
    process.exit()
  })
