# time-diff-client
Connects to [time-diff-server](https://github.com/codealchemist/time-diff-server) 
to calculate time diff with it, useful for time synchronization.


## Use case

Let's say you want to run something on multiple clients with very low time different
between them. Start playing audio, for example.

**time-diff-client** will help you do that by allowing each client to calculate
its time difference with the time server.

When all clients know their time difference with the time server you can instruct
all clients to do stuff at server time, thus achieving a good level of synchrony.


## Install

`npm install --save time-diff-client`


## Usage

**time-diff-client** comes in two fashions:

- WebSockets
- UDP

UDP should be the preferred option because it normally has lower latency than WebSockets.
But you can choose whichever is best suited for your use case.


### UDP

```javascript
const TimeClient = require('time-diff-client/udp')

// These are the default values.
const params = {
  port: 3025,
  maxIterations: 150,
  minPrecision: 5, // ms
  debug: true
}
const timeClient = new TimeClient(params)
timeClient
  .init()
  .onDiff((diff) => {
    console.log('TIME DIFF:', diff)
    process.exit()
  })

```


### WebSockets

```javascript
const TimeClient = require('time-diff-client/ws')

// These are the default values.
const params = {
  timeDiffServer: 'ws://localhost:8001',
  maxIterations: 150,
  minPrecision: 5, // ms
  debug: true
}
const timeClient = new TimeClient(params)
timeClient
  .init()
  .onDiff((diff) => {
    console.log('TIME DIFF:', diff)
    process.exit()
  })

```


## Run test clients

These are test implementation of **time-diff-client** that connects to a 
[time-diff-server](https://github.com/codealchemist/time-diff-server) 
instance and prints time diff to console.

The following params can be passed from the command line:

- `DEBUG`: Prints info to console. Default is `true`.
- `PORT`: Client port. Default is `3025`. Only available on UDP mode.
- `MAX_ITERATIONS`: How many requests will be made to the time server. Default is `150`.
- `PRECISION`: Min precision we're interested in, expressed in ms. Default is `5`.
- `TIME_SERVER_URL`: URL to [time-diff-server](https://github.com/codealchemist/time-diff-server) instance.
Default is 'ws://localhost:8001'. There's no server for UDP, it uses local broadcast in this mode.

WebSockets client test:

`node_modules/.bin/tdc-ws-test`

Passing params:

`PORT=3000 PRECISION=2 node_modules/.bin/tdc-ws-test`

UDP client test:

`node_modules/.bin/tdc-udp-test`

Passing params:

`PORT=3000 PRECISION=2 node_modules/.bin/tdc-udp-test`

A better approach if you find yourself using this a lot is to add it to your npm scripts:

```json
"scripts": {
  "tdc-ws-test": "tdc-ws-test",
  "tdc-udp-test": "tdc-udp-test"
}
```

And then run:

`npm run tdc-ws-test`

Or:

`npm run tdc-udp-test`

This commands will work directly if you install **time-diff-client** globally:

`tdc-ws-test` and `tdc-udp-test`.


## Test

If you clone this repo and want to check code changes run:

`npm test`

Or:

`npm run test-focus`

Also run the test clients to ensure connection to **time-diff-server**
still works OK.


Enjoy!
