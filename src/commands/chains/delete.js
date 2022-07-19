const ruleConfig = require('../../config/rules')
const DEFAULT_CHAIN = ['FORWARD', 'INPUT', 'OUTPUT', 'PREROUTING', 'POSTROUTING']
const getRouterByOption = require('../../helper/getRouterByOption')

const deleteChain = (chainName, options) => {
  if (DEFAULT_CHAIN.find(item => item == chainName)) {
    throw new Error('Invalid chain name')
  }
  const table = options['table'] || 'filter'
  const filterRouters = getRouterByOption(options)
  for (const router of filterRouters) {
    let routerSetting = ruleConfig.get(router.name)
    if (routerSetting) {
      if(!routerSetting[table]) {
        throw new Error('Invalid table')
      }
      let chains = routerSetting[table]
      let idx = Object.keys(chains).indexOf(chainName)
      if (idx < 0) {
        throw new Error('Not exist chain')
      }
      delete chains[chainName]
    }
    ruleConfig.set(router.name, routerSetting)
  }
}

module.exports = deleteChain