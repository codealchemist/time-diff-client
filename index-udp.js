const UdpNode = require('udp-node')

module.exports = class TimeClient {
  constructor (timeServerUrl) {
    this.node = new UdpNode()
    this.node
      .set({
        name: 'time-client',
        type: 'time-client',
        port: 3025
      })
    log('TIME CLIENT UP')

    this.events = {
      time: (value) => this.onTime(value)
    }
    this.times = {
      requestTime: null,
      serverTime: null,
      responseTime: null
    }
    this.iterations = 0
    this.maxIterations = 1500
    this.precision = 2
    this.onDiffCallback
  }

  init () {
    this.node.on('time', (message, rinfo) => {
      log('got message', message, rinfo)
      const {type, value} = message
      if (!this.events[type]) return
      this.events[type](value)
    })

    // Ask for server time.
    this.start()

    return this
  }

  onDiff (callback) {
    this.onDiffCallback = callback
  }

  start () {
    ++this.iterations
    this.times.requestTime = (new Date()).getTime()
    this.node.send({type: 'time', value: this.times.request})
  }

  reset () {
    this.times.requestTime = null
    this.times.serverTime = null
    this.times.responseTime = null
  }

  haveSymmetricLatency ({requestTime, serverTime, responseTime}) {
    const requestDiff = Math.abs(serverTime - requestTime)
    const responseDiff = Math.abs(responseTime - serverTime)

    const diff = Math.abs(requestDiff - responseDiff)
    log(`request diff: ${requestDiff} | response diff: ${responseDiff} --> DIFF: ${diff}`)
    return (diff <= this.precision)
  }

  /**
   * Returns time difference between client and server clocks.
   * If response is > 0, client is ahead.
   * If response is < 0, client is behind.
   *
   * @param  {int} options.requestTime
   * @param  {int} options.serverTime
   * @param  {int} options.responseTime
   * @return {int}
   */
  getTimeDiff ({requestTime, serverTime, responseTime}) {
    const latency = Math.round((responseTime - requestTime) / 2)
    const serverTimeOnRequest = serverTime - latency
    const diff = requestTime - serverTimeOnRequest

    // log(`/// TIME DIFF: ${diff} ///`)
    if (typeof this.onDiffCallback === 'function') {
      this.onDiffCallback(diff)
    }
    return diff
  }

  onTime (value) {
    log('got time', value)
    this.times.serverTime = value
    this.times.responseTime = (new Date()).getTime()

    log('TIMES:', this.times)
    // Symmetric latency allows to calculate time diff.
    if (this.haveSymmetricLatency(this.times)) {
      return this.getTimeDiff(this.times)
    }

    if (this.iterations >= this.maxIterations) {
      log('max iterations reached, aborting.')
      return
    }

    // Continue making time requests until symmetric latency
    // is achieved.
    log(`Symmetric latency not achieved yet, try again #${this.iterations}`)
    this.reset()
    this.start()
  }
}

function log () {
  console.log('[ TIME-DIFF-CLIENT ]-->', ...arguments)
}
