'use strict'

const { EventEmitter } = require('events')
const debug = require('debug')('nock.socket')

function noop() {}

module.exports = class Socket extends EventEmitter {
  constructor(options) {
    super()

    if (options.proto === 'https') {
      // https://github.com/nock/nock/issues/158
      this.authorized = true
    }

    this.writable = true
    this.readable = true
    this.destroyed = false
    this.connecting = false

    this.setNoDelay = noop
    this.setKeepAlive = noop
    this.resume = noop
    this.unref = noop

    // totalDelay that has already been applied to the current
    // request/connection, timeout error will be generated if
    // it is timed-out.
    this.totalDelayMs = 0
    // Maximum allowed delay. Null means unlimited.
    this.timeoutMs = null
  }

  setTimeout(timeoutMs, fn) {
    this.timeoutMs = timeoutMs
    if (fn) {
      this.once('timeout', fn)
    }
  }

  applyDelay(delayMs) {
    this.totalDelayMs += delayMs

    if (this.timeoutMs && this.totalDelayMs > this.timeoutMs) {
      debug('socket timeout')
      this.emit('timeout')
    }
  }

  getPeerCertificate() {
    return Buffer.from(
      (Math.random() * 10000 + Date.now()).toString()
    ).toString('base64')
  }

  destroy() {
    this.destroyed = true
    this.readable = this.writable = false
  }
}
