const generateOption = require('../../helper/generateOption')
const forwardRule = require('../../helper/forwardRoute')
const saveRule = require('../../helper/saveRule')

const insertRule = (chainName, ruleOrder, options) => {
  if (!chainName) {
    throw new Error('Chain must be specified')
  }
  let res = `sudo iptables -I ${chainName} `
  if (ruleOrder) {
    res += ruleOrder + ' '
  }
  res += generateOption(options)
  if (options['jump']) {
    res += `-j ${options['jump']}`
  }
  // console.log(res)
  saveRule({
    chainName,
    ruleOrder,
    options,
    type: 'insert',
    rule: res
  })
  forwardRule(options, res)
  return res
}

module.exports = insertRule