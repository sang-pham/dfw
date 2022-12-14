const { generateIpList } = require('../../helper/ip')
const generateOptions = require('../../helper/generateOption')
const forwardRule = require('../../helper/forwardRoute')
const fetch = require('node-fetch')
const saveRule = require('../../helper/saveRule')
const { dfwOptions2RuleObj } = require('../../helper/convertOptions')
const getRouterByOption = require('../../helper/getRouterByOption')

const appendRule = async (args, options) => {
  try {
    if (!args) {
      throw new Error('Chain must be specified')
    }
    // console.log(options)
    // let res = `-A ${args} `
    let res = ""
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
    // saveRule({
    //   chainName: args,
    //   rule: res,
    //   options,
    //   type: 'append'
    // })
    // forwardRule(options, res)
      // console.log(JSON.stringify({rule: res}))
    let rule = dfwOptions2RuleObj(options)
    console.log(rule)
    let filterRouters = getRouterByOption(options)
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