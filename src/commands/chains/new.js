const ruleConfig = require('../../config/rules')
const getRouterByOption = require('../../helper/getRouterByOption')

const DEFAULT_CHAIN = ['FORWARD', 'INPUT', 'OUTPUT', 'PREROUTING', 'POSTROUTING']

const newChain = (chainName, options) => {
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
      if (Object.keys(chains).find(item => item === chainName)) {
        throw new Error('Exist chain')
      }
      chains[chainName] = []
    }
    ruleConfig.set(router.name, routerSetting)
  }
}

module.exports = newChain