const generateOption = require('../../helper/generateOption')
const fetch = require('node-fetch')
const { dfwOptions2RuleObj } = require('../../helper/convertOptions')
const getRouterByOption = require('../../helper/getRouterByOption')
const { autoIdentifyFirewalls } = require('../../lib/utils')

const insertRule = async (chainName, ruleOrder, options) => {
  console.log(chainName, ruleOrder)
  if (!chainName) {
    console.log('Chain must be specified')
    return
  }
  if(typeof chainName != 'string') {
    console.log('Invalid chain name')
    return
  }
  let rule = dfwOptions2RuleObj(options)
  console.log(rule)
  let filterRouters = getRouterByOption(options)
  if (!options['firewallName'] && !options['firewallIp']) {
    filterRouters = autoIdentifyFirewalls(options, chainName, options['table']  || 'filter', filterRouters)
  }
  for (const router of filterRouters) {
    const response = await fetch(`http://${router.ip}:${router.port}/rules/${options['table']  || 'filter'}/${chainName}`, {
      method: 'post',
      body: JSON.stringify({
        data: [rule],
        order: ruleOrder || 1
      }),
      headers: {'Content-Type': 'application/json'}
    })
    if (response.status == 200) {
      console.log(`Insert success for router ${router.name}`)
    } else {
      try {
        let body = await response.json()
        console.log((body.message || 'Something is wrong') + ` for router ${router.name}`)
      } catch (error) {
        console.log(error)
      }
    }
  }
}

module.exports = insertRule