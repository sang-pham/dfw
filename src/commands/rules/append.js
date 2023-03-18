const { generateIpList } = require('../../helper/ip')
const generateOptions = require('../../helper/generateOption')
const fetch = require('node-fetch')
const { dfwOptions2RuleObj } = require('../../helper/convertOptions')
const getRouterByOption = require('../../helper/getRouterByOption')
const { autoIdentifyFirewalls } = require('../../lib/utils')

const appendRule = async (args, options) => {
  try {
    if (!args) {
      throw new Error('Chain must be specified')
    }
    let res = ""
    let listSource = generateIpList(options, 'source')
    let listDest = generateIpList(options, 'destination')
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
    let rule = dfwOptions2RuleObj(options)
    console.log(rule)
    let filterRouters = getRouterByOption(options)
    if (!options['firewallName'] && !options['firewallIp']) {
      filterRouters = autoIdentifyFirewalls(options, args, options['table']  || 'filter', filterRouters)
    }
    for (const router of filterRouters) {
      const response = await fetch(`http://${router.ip}:${router.port}/rules/${options['table']  || 'filter'}/${args}`, {
        method: 'post',
        body: JSON.stringify({
          data: [rule],
          order: 0
        }),
        headers: {'Content-Type': 'application/json'}
      })
      if (response.status == 200) {
        console.log(`Append success for firewall ${router.name}`)
      } else {
        let body = await response.json()
        console.log((body.message || 'Something is wrong') + ` for firewall ${router.name}}`)
      }
    }


  } catch (error) {
    throw error
  }
}

module.exports = appendRule;