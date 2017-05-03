const TimeClient = require('./index-udp')
const timeClient = new TimeClient()
timeClient
  .init()
  .onDiff((diff) => {
    console.log('-'.repeat(80))
    console.log('--- GOT CLOCKS DIFF:', diff)
    console.log('-'.repeat(80))
    process.exit()
  })
