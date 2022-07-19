const generateOption = require('../../helper/generateOption')
const forwardRule = require('../../helper/forwardRoute')
const saveRule = require('../../helper/saveRule')

const deleteRule = (chainName, ruleOrder, options) => {
  if (!chainName) {
    throw new Error('Chain must be specified')
  }
  if (!isNaN(chainName)) {
    throw new Error('Invalid chain')
  }
  let res = `sudo iptables -D ${chainName} `
  if (ruleOrder) {
    res += ruleOrder
  } else {
    res += generateOption(options)
  }
  saveRule({
    chainName,
    ruleOrder,
    options,
    type: 'delete'
  })
  forwardRule(options, res)
  return res
}

module.exports = deleteRule