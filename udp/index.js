#!/usr/bin/env node
const UdpNode = require('udp-node')
const chalk = require('chalk')

module.exports = class TimeClient {
  constructor ({port, maxIterations, minPrecision, debug} = {}) {
    this.debug = debug || process.env.DEBUG || true
    this.port = port || process.env.PORT || 3025
    this.node = new UdpNode()
    this.node
      .set({
        name: 'time-client',
        type: 'time-client',
        port: this.port,
        logLevel: 'error'
      })

    this.events = {
      time: (value) => this.onTime(value)
    }
    this.times = {
      request: null, // time when client sends the request
      response: null, // time when client receives the response
      delay: null, // diff between request and response
      server: null // local server time
    }
    this.timesCollection = []
    this.iterations = 0
    this.maxIterations = maxIterations || process.env.MAX_ITERATIONS || 150
    this.minPrecision = minPrecision || process.env.PRECISION || 5
    this.onDiffCallback

    this.log(chalk.bold('UDP TIME-DIFF-CLIENT UP'))
  }

  init () {
    this.node.on('time', (message, rinfo) => {
      this.onTime(message.value)
    })

    // Ask for server time.
    this.request()

    return this
  }

  onDiff (callback) {
    this.onDiffCallback = callback
  }

  request () {
    ++this.iterations
    this.times.request = (new Date()).getTime()
    this.node.send({type: 'time'})
  }

  reset () {
    this.timesCollection = []
    this.iterations = 0
    this.times.request = null
    this.times.serverTime = null
    this.times.response = null
  }

  /**
   * Returns time difference between client and server clocks.
   * If response is > 0, client is ahead.
   * If response is < 0, client is behind.
   *
   * @param  {int} options.request
   * @param  {int} options.server
   * @param  {int} options.response
   * @return {int}
   */
  getTimeDiff ({request, server, response, delay}) {
    const approxLatency = delay / 2
    const serverTimeOnRequest = server - approxLatency
    const diff = request - serverTimeOnRequest
    this.log('approx latency:', approxLatency)

    if (typeof this.onDiffCallback === 'function') {
      this.onDiffCallback(diff)
    }
  }

  onTime (value) {
    this.times.response = (new Date()).getTime()
    this.times.server = value
    this.times.delay = this.times.response - this.times.request
    this.timesCollection.push(clone(this.times))
    this.log(`TIMES on ${chalk.blue(`#${this.iterations}`)}:`, this.times)

    // Stop iterating if we got a fast enough response.
    if (this.times.delay <= this.minPrecision) {
      this.log(`${chalk.white('GOT FAST response')} on ${chalk.blue(`#${this.iterations}`)}`)
      this.getTimeDiff(this.times)
      return
    }

    if (this.iterations < this.maxIterations) {
      // Ask for server time again.
      this.request()
      return
    }

    // Pick the fastest time to calculate and approx. latency.
    const fastest = this.getFastestTimes()
    this.getTimeDiff(fastest)
  }

  getFastestTimes () {
    // Once we have all the times we need sort them by delay.
    const unsortedDelays = this.timesCollection.map((times) => {
      return times.delay
    })

    this.timesCollection = this.timesCollection.sort((times1, times2) => {
      return times1.delay - times2.delay
    })

    const sortedDelays = this.timesCollection.map((times) => {
      return times.delay
    })

    // On the sorted array the first one is the fastest.
    return this.timesCollection[0]
  }

  log () {
    if (!this.debug) return
    const ts = (new Date()).toISOString()
    console.log(`${chalk.dim(ts)}:`, ...arguments)
  }
}

function clone (obj) {
  return JSON.parse(JSON.stringify(obj))
}
