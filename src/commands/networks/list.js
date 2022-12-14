const { getToken } = require('../../lib/cache/user.cache')
const fetch = require('node-fetch')
const { getNetworkKeyMap } = require('../../helper/mappingKey')
const config = require('../../../config.json')

const NETWORK_URL = config['network_url']

const beautifyNetworkOuputs = (networks) => {
  console.log('ID\t\t\t\t\tName\t\tSubnets')
  for (const network of networks) {
    let subnets = network.subnets.reduce((res, curr, idx) => {
      if (idx == 0) return curr
      else return res + `\t\t\t\t\t\t\t\t${curr}`
    },'')
    console.log(`${network.id}\t${network.name}\t\t${subnets}`)
  }
}

const listNetworks = async (options) => {
  let query = Object.keys(options)
              .map(key => (getNetworkKeyMap[encodeURIComponent(key)] || encodeURIComponent(key))
                    + '=' + encodeURIComponent(typeof options[key] == 'boolean' ? Number(options[key]): options[key]))
              .join('&')
  try {
    const response = await fetch(
      NETWORK_URL + '/networks?' + query, 
      {
        headers: {
          'X-Auth-Token': await getToken()
        }
      }
    )
    let data = await response.json()
    const networks = data.networks
    console.log(networks)
    beautifyNetworkOuputs(networks)
  } catch (error) {
    console.log(error)
  }
}

module.exports = listNetworks