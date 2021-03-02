'use strict'

/**
 * Clears the tick interval prior to teardown
 *
 * @memberOf module:TWAP
 * @listens AOHost~lifeStop
 *
 * @param {object} instance - AO instance
 * @returns {Promise} p - resolves on completion
 */
const onLifeStop = async (instance = {}) => {
  const { state = {}, h = {} } = instance
  const { interval, args = {}, orders = {}, gid } = state
  const { debug, updateState, emit } = h
  const { cancelDelay } = args

  if (interval !== null) {
    clearInterval(interval)
    await updateState(instance, { interval: null })
    debug('cleared interval')
  }

  debug('detected twap algo cancelation, stopping...')

  await emit('exec:order:cancel:all', gid, orders, cancelDelay)
}

module.exports = onLifeStop
