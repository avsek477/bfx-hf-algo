module.exports = () => ({
  label: 'TWAP',
  customHelp: 'TWAP spreads an order out through time in order to fill at the time-weighted average price, calculated between the time the order is submitted to the final atomic order close.\n\nConditions may be specified to match against either the order book or last trade, allowing you to shape the final TWAP value based on your specific needs.',
  connectionTimeout: 10000,
  actionTimeout: 10000,

  header: {
    component: 'ui.checkbox_group',
    fields: ['tradeBeyondEnd']
  },

  sections: [{
    title: '',
    name: 'general',
    rows: [
      ['orderType', 'amount'],
      ['sliceAmount', 'sliceInterval']
    ]
  }, {
    title: '',
    name: 'price',

    visible: {
      orderType: { eq: 'LIMIT' }
    },

    rows: [
      ['priceTarget', 'price'],
      ['priceCondition', 'priceDelta']
    ]
  }, {
    rows: [['action', null]]
  }],

  fields: {
    tradeBeyondEnd: {
      component: 'input.checkbox',
      label: 'Trade Beyond End',
      customHelp: 'Continue trading beyond slice interval',
      default: false
    },

    orderType: {
      component: 'input.dropdown',
      label: 'Order Type',
      default: 'LIMIT',
      options: {
        LIMIT: 'Limit',
        MARKET: 'Market'
      }
    },

    amount: {
      component: 'input.amount',
      label: 'Amount $BASE',
      customHelp: 'Total order amount',
      priceField: 'price'
    },

    sliceAmount: {
      component: 'input.number',
      label: 'Slice Amount $BASE',
      customHelp: 'Total slice size'
    },

    sliceInterval: {
      component: 'input.number',
      label: 'Slice Interval (sec)',
      customHelp: 'Duration over which to trade slice'
    },

    priceDelta: {
      component: 'input.number',
      label: 'Target Delta',
      customHelp: '± Distance from price target for match'
    },

    price: {
      component: 'input.price',
      label: 'Price $QUOTE',
      customHelp: 'Requires \'custom\' price target',
      disabled: {
        priceTarget: { neq: 'custom' }
      }
    },

    priceTarget: {
      component: 'input.dropdown',
      label: 'Price Target',
      default: 'OB_MID',
      options: {
        OB_MID: 'OB mid price',
        OB_SIDE: 'OB side price',
        LAST: 'Last trade price',
        custom: 'Custom'
      }
    },

    priceCondition: {
      component: 'input.dropdown',
      label: 'Price Condition',
      default: 'MATCH_MIDPOINT',
      customHelp: 'Match point for custom price targets',
      disabled: {
        priceTarget: { neq: 'custom' }
      },

      options: {
        MATCH_MIDPOINT: 'Match OB mid price',
        MATCH_SIDE: 'Match OB side',
        MATCH_LAST: 'Match last trade price'
      }
    },

    action: {
      component: 'input.radio',
      label: 'Action',
      options: ['Buy', 'Sell'],
      inline: true,
      default: 'Buy'
    }
  },

  actions: ['preview', 'submit']
})