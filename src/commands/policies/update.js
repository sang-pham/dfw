const fetch = require('node-fetch')
const getRouterByOption = require('../../helper/getRouterByOption')

const updatePolicy = async (chain, newPolicy, options) => {
  const table = options['table'] || 'filter'
  try {
    if (!chain) {
      throw new Error('Chain must be specified')
    }
    if (!newPolicy) {
      throw new Error('New policy must be specified')
    }
    const defaultChains = {
      filter: ['INPUT', 'OUTPUT', 'FORWARD'],
      nat: ['INPUT', 'OUTPUT', 'PREROUTING', 'POSTROUTING'],
      mangle: ['PREROUTING', 'INPUT', 'FORWARD', 'OUTPUT', 'POSTROUTING']
    }
    let chains = defaultChains[table]
    if (!chains.find(item => item == chain)) {
      throw new Error('Invalid chain ' + chain)
    }
    const polices = ['ACCEPT', 'REJECT', 'DROP']
    if (!polices.find(item => item == newPolicy)) {
      throw new Error('Invalid policy' + newPolicy)
    }
    const routers = getRouterByOption(options)
    if (!routers.length) return
    for (const router of routers) {
      const res = await fetch(`http://${router.ip}:${router.port}/policy/${table}/${chain}`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': router.key
        },
        body: JSON.stringify({
          policy: newPolicy
        })
      })
      if(res.status == 200) {
        console.log(`Update policy successfully for chain ${chain} in router ${router.name} - ${router.ip}`)
      } else if (res.status == 401) {
        throw new Error(`Invalid API key with firewall ${router.name}`)
      } else {
        throw new Error('Something is wrong')
      }
    }
  } catch (error) {
    if(error) console.log(error.message)
    else console.log('Something wrong')
  }
}

module.exports = updatePolicy