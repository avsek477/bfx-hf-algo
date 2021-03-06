'use strict'

const withAOUpdate = require('../with_ao_update')

/**
 * Broadcasts a ucm notification to be picked up by the UI
 *
 * @param {object} aoHost - algo host
 * @param {string} gid - AO instance gid
 * @param {string} level - notification level, i.e. 'info', 'success', etc
 * @param {string} message - text to show to user
 * @returns {object} nextInstanceState
 */
module.exports = async (aoHost, gid, level, message) => {
  const { adapter } = aoHost

  await withAOUpdate(aoHost, gid, async (instance = {}) => {
    const { state = {} } = instance
    const { connection } = state

    adapter.notify(connection.c, level, message)

    return null
  })
}
