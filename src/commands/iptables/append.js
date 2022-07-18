const { generateIpList } = require('../../helper/ip')
const generateOptions = require('../../helper/generateOption')
const forwardRule = require('../../helper/forwardRoute')
const saveRule = require('../../helper/saveRule')

const appendRule = (args, options) => {
  try {
    if (!args) {
      throw new Error('Chain must be specified')
    }
    // console.log(options)
    let res = `sudo iptables -A ${args} `
    let listSource = generateIpList(options, 'source')
    let listDest = generateIpList(options, 'destination')
    // console.log(listSource, listDest)
    let numOfRules = 1;
    if (listSource.length) {
      numOfRules *= listSource.length
    }
    if (listDest.length) {
      numOfRules *= listDest.length
    }
    res += generateOptions(options)
    if (options['jump']) {
      res += `-j ${options['jump']}`
    }
    saveRule({
      chainName: args,
      rule: res,
      options,
      type: 'append'
    })
    forwardRule(options, res)

  } catch (error) {
    throw error
  }
}

module.exports = appendRule;