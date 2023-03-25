const getRouterByOption = require('../../helper/getRouterByOption')
const fetch = require('node-fetch')

const DEFAULT_CHAIN = ['FORWARD', 'INPUT', 'OUTPUT', 'PREROUTING', 'POSTROUTING']

const newChain = async (chainName, options) => {
  if (!chainName) {
    console.log(`Chain name must be provided`)
    return
  }
  if (DEFAULT_CHAIN.find(item => item == chainName)) {
    console.log('Invalid chain name because it has already been default')
    return
  }
  const table = options['table'] || 'filter'
  const filterRouters = getRouterByOption(options)
  for (const router of filterRouters) {
    try {
      const response = await fetch(
        `http://${router.ip}:${router.port}/chains`,
        {
          method: 'post',
          body: JSON.stringify({
            data: {
              table,
              chain: chainName
            }
          }),
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

module.exports = newChain