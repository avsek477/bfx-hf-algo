'use strict'

const { TIME_FRAME_WIDTHS } = require('bfx-hf-util')
const _isFinite = require('lodash/isFinite')
const _isObject = require('lodash/isObject')
const _isBoolean = require('lodash/isBoolean')
const _includes = require('lodash/includes')

const ORDER_TYPES = ['MARKET', 'LIMIT', 'RELATIVE']

/**
 * Verifies that a parameters Object is valid, and all parameters are within
 * the configured boundaries for a valid AccumulateDistribute order.
 *
 * Part of the `meta` handler section.
 *
 * @memberOf module:AccumulateDistribute
 * @param {object} args - incoming parameters
 * @param {number} args.amount - total order amount
 * @param {number} args.sliceAmount - individual slice order amount
 * @param {number} args.sliceInterval - delay in ms between slice orders
 * @param {number} [args.intervalDistortion] - slice interval distortion in %, default 0
 * @param {number} [args.amountDistortion] - slice amount distortion in %, default 0
 * @param {string} args.orderType - LIMIT, MARKET, RELATIVE
 * @param {number} [args.limitPrice] - price for LIMIT orders
 * @param {boolean} args.catchUp - if true, interval will be ignored if behind with filling slices
 * @param {boolean} args.awaitFill - if true, slice orders will be kept open until filled
 * @param {object} [args.relativeOffset] - price reference for RELATIVE orders
 * @param {string} [args.relativeOffset.type] - ask, bid, mid, last, ma, or ema
 * @param {number} [args.relativeOffset.delta] - offset distance from price reference
 * @param {number[]} [args.relativeOffset.args] - MA or EMA indicator arguments [period]
 * @param {string} [args.relativeOffset.candlePrice] - 'open', 'high', 'low', 'close' for MA or EMA indicators
 * @param {string} [args.relativeOffset.candleTimeFrame] - '1m', '5m', '1D', etc, for MA or EMA indicators
 * @param {object} [args.relativeCap] - maximum price reference for RELATIVE orders
 * @param {string} [args.relativeCap.type] - ask, bid, mid, last, ma, or ema
 * @param {number} [args.relativeCap.delta] - cap distance from price reference
 * @param {number[]} [args.relativeCap.args] - MA or EMA indicator arguments [period]
 * @param {string} [args.relativeCap.candlePrice] - 'open', 'high', 'low', 'close' for MA or EMA indicators
 * @param {string} [args.relativeCap.candleTimeFrame] - '1m', '5m', '1D', etc, for MA or EMA indicators
 * @returns {string} error - null if parameters are valid, otherwise a
 *   description of which parameter is invalid.
 */
const validateParams = (args = {}) => {
  const {
    limitPrice, amount, sliceAmount, orderType, submitDelay, cancelDelay,
    intervalDistortion, amountDistortion, sliceInterval, relativeOffset,
    relativeCap, catchUp, awaitFill, lev, _futures
  } = args

  if (!_includes(ORDER_TYPES, orderType)) return `Invalid order type: ${orderType}`
  if (!_isFinite(amount)) return 'Invalid amount'
  if (!_isFinite(sliceAmount)) return 'Invalid slice amount'
  if (!_isFinite(submitDelay) || submitDelay < 0) return 'Invalid submit delay'
  if (!_isFinite(cancelDelay) || cancelDelay < 0) return 'Invalid cancel delay'
  if (!_isBoolean(catchUp)) return 'Bool catch up flag required'
  if (!_isBoolean(awaitFill)) return 'Bool await fill flag required'
  if (!_isFinite(sliceInterval) || sliceInterval <= 0) return 'Invalid slice interval'
  if (!_isFinite(intervalDistortion)) return 'Interval distortion required'
  if (!_isFinite(amountDistortion)) return 'Amount distortion required'
  if (orderType === 'LIMIT' && !_isFinite(limitPrice)) {
    return 'Limit price required for LIMIT order type'
  }

  if (_isObject(relativeCap)) {
    if (!_isFinite(relativeCap.delta)) {
      return 'Invalid relative cap delta'
    }

    if ((relativeCap.type === 'ma') || (relativeCap.type === 'ema')) {
      const { args = [] } = relativeCap

      if (args.length !== 1) {
        return 'Invalid args for relative cap indicator'
      }

      if (!relativeCap.candlePrice) {
        return 'Candle price required for relative cap indicator'
      } else if (!relativeCap.candleTimeFrame) {
        return 'Candle time frame required for relative cap indicator'
      } else if (!TIME_FRAME_WIDTHS[relativeCap.candleTimeFrame]) {
        return `Unrecognized relative cap candle time frame: ${relativeCap.candleTimeFrame}`
      } else if (!_isFinite(relativeCap.args[0])) {
        return `Invalid relative cap indicator period: ${relativeCap.args[0]}`
      }
    }
  }

  if (_isObject(relativeOffset)) {
    if (!_isFinite(relativeOffset.delta)) {
      return 'Invalid relative offset delta'
    }

    if ((relativeOffset.type === 'ma') || (relativeOffset.type === 'ema')) {
      const { args = [] } = relativeOffset

      if (args.length !== 1) {
        return 'Invalid args for relative offset indicator'
      }

      if (!relativeOffset.candlePrice) {
        return 'Candle price required for relative offset indicator'
      } else if (!relativeOffset.candleTimeFrame) {
        return 'Candle time frame required for relative offset indicator'
      } else if (!TIME_FRAME_WIDTHS[relativeOffset.candleTimeFrame]) {
        return `Unrecognized relative offset candle time frame: ${relativeOffset.candleTimeFrame}`
      } else if (!_isFinite(relativeOffset.args[0])) {
        return `Invalid relative offset indicator period: ${relativeOffset.args[0]}`
      }
    }
  }

  if (
    (amount < 0 && sliceAmount >= 0) ||
    (amount > 0 && sliceAmount <= 0)
  ) {
    return 'Amount & slice amount must have same sign'
  }

  if (_futures) {
    if (!_isFinite(lev)) return 'Invalid leverage'
    if (lev < 1) return 'Leverage less than 1'
    if (lev > 100) return 'Leverage greater than 100' // TODO: change limit?
  }

  return null
}

module.exports = validateParams
