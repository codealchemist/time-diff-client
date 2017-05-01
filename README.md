# time-diff-client
Connects to time-diff-server to calculates time diff with it, useful for time synchronization.

## Install

`npm install --save time-diff-client`


## Usage

```
const TimeClient = require('time-diff-client')

const serverUrl = 'ws://URL-OF-TIME-DIFF-SERVER:PORT'
const timeClient = new TimeClient(serverUrl)
timeClient
  .init()
  .onDiff((diff) => {
    console.log('-'.repeat(80))
    console.log('--- GOT CLOCKS DIFF:', diff)
    console.log('-'.repeat(80))
    process.exit()
  })

```


## Test

`npm test`

Or:

`npm run test-focus`


Enjoy!
