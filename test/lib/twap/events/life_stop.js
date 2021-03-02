/* eslint-env mocha */
'use strict'

const assert = require('assert')
const onLifeStop = require('../../../../lib/twap/events/life_stop')

describe('twap:events:life_stop', () => {
  it('sets up interval & saves it on state', (done) => {
    const interval = setInterval(() => {
      done(new Error('interval should not have been set'))
    }, 10)

    onLifeStop({
      state: { interval },
      h: {
        updateState: () => {},
        debug: () => {},
        emit: () => {}
      }
    })

    setTimeout(done, 50)
  })

  it('cancels all order set by the twap algo', async () => {
    let cancelledOrders = false

    await onLifeStop({
      state: {},
      h: {
        updateState: () => {},
        debug: () => {},
        emit: (eventName) => {
          if (eventName === 'exec:order:cancel:all') {
            cancelledOrders = true
          }
        }
      }
    })

    assert.ok(cancelledOrders, 'did not cancel orders set by twap algo')
  })
})
