const generateOption = require('../../helper/generateOption')
const forwardRule = require('../../helper/forwardRoute')
const saveRule = require('../../helper/saveRule')
const fetch = require('node-fetch')
const { dfwOptions2RuleObj } = require('../../helper/convertOptions')
const getRouterByOption = require('../../helper/getRouterByOption')

const insertRule = async (chainName, ruleOrder, options) => {
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
  // saveRule({
  //   chainName,
  //   ruleOrder,
  //   options,
  //   type: 'insert',
  //   rule: res
  // })
  // forwardRule(options, res)
  // return res
  let rule = dfwOptions2RuleObj(options)
  console.log(ruleOrder)
  console.log(rule)
  let filterRouters = getRouterByOption(options)
  for (const router of filterRouters) {
    const response = await fetch(`http://${router.ip}:5000/rules/${options['table']  || 'filter'}/${chainName}`, {
      method: 'post',
      body: JSON.stringify({
        data: [rule],
        order: ruleOrder || -1
      }),
      headers: {'Content-Type': 'application/json'}
    })
    if (response.status == 200) {
      console.log(`Insert success for router ${router.name}`)
    } else {
      let body = await response.json()
      console.log((body.message || 'Something is wrong') + ` for router ${router.name}`)
    }
  }
}

module.exports = insertRule