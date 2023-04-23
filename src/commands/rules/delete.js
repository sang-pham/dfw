const generateOption = require('../../helper/generateOption')
const fetch = require('node-fetch')
const getRouterByOption = require('../../helper/getRouterByOption')

const deleteRule = async (chainName, ruleOrder, options) => {
  if (!chainName) {
    throw new Error('Chain must be specified')
  }
  if (!isNaN(chainName)) {
    throw new Error('Invalid chain')
  }
  let res = `sudo iptables -D ${chainName} `
  let filterRouters = getRouterByOption(options)
  if (!isNaN(ruleOrder)) {
    res += ruleOrder
    for (const router of filterRouters) {
      try {
        const response = await fetch(`http://${router.ip}:${router.port}/rules/${options['table']  || 'filter'}/${chainName}/${ruleOrder}`, {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': router.key
          }
        })
        if (response.status == 200) {
          console.log(`Delete success for router ${router.name}`)
        } else if (response.status == 401) {
          throw new Error(`Invalid API key with firewall ${router.name}`)
        } else {
          let body = await response.json()
          console.log((body.message || 'Something is wrong') + ` for router ${router.name}`)
        }
      } catch (error) {
        if (error.code == 'ECONNREFUSED') {
          console.log(`Unable to connect to the agent at ${router.ip}:${router.port}. Make sure that your agent are running`)
          return
        }
        console.log(error.message || error)
      }
    }
    return
  } else {
    res += generateOption(options)
  }
  return res
}

module.exports = deleteRule