const DEFAULT_CHAIN = ['FORWARD', 'INPUT', 'OUTPUT', 'PREROUTING', 'POSTROUTING']
const getRouterByOption = require('../../helper/getRouterByOption')
const fetch = require('node-fetch')

const deleteChain = async (chainName, options) => {
  if (!chainName) {
    console.log('Chain name must be provided')
    return
  }
  if (DEFAULT_CHAIN.find(item => item == chainName)) {
    console.log(`Chain ${chainName} cann't be deleted because it's default iptables chain`)
    return
  }
  const table = options['table'] || 'filter'
  let isFlush = options['flush']
  const filterRouters = getRouterByOption(options)
  for (const router of filterRouters) {
    try {
      const response = await fetch(
        `http://${router.ip}:${router.port}/chains/${table}/${chainName}?${isFlush ? 'is_flush=1': ''}`,
        {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': router.key
          }
        }
      )
      if (response.status == 401) {
        throw new Error(`Invalid API key with firewall ${router.name}`)
      }
      const data = await response.json()
      let { message } = data
      console.log(`Firewall ${router.name}-${router.ip}:${router.port}: ${message}`)
    } catch (error) {
      if (error.code == 'ECONNREFUSED') {
        console.log(`Unable to connect to the agent at ${router.ip}:${router.port}. Make sure that your agent are running`)
        continue
      }
      console.log(error.message || error)
    }
  }
}

module.exports = deleteChain