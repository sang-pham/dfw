const fetch = require('node-fetch')
const getRouterByOption = require('../../helper/getRouterByOption')

const zeroChain = async (chain, options) => {
  let table = options['table']
  const routers = getRouterByOption(options)
  if (!routers.length) return
  if (!table && !chain) {
    for (const router of routers) {
      try {
        const response = await fetch(`http://${router.ip}:${router.port}/chains/zero`, {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': router.key
          }
        })
        if (response.status == 200) {
          console.log(`Zero all chains in firewall ${router.name} successfully `)
        } else if (response.status == 401) {
          throw new Error(`Invalid API key firewall ${router.name}`)
        } else {
          const body = await response.json()
          console.log(`Firewall ${router.name}: ${body.message || 'Something is wrong, fail to zero.'}`)
        }
      } catch (error) {
        console.log(error.message || error)
      }
    }
    return
  }
  if (table && !chain) {
    for (const router of routers) {
      try {
        const response = await fetch(`http://${router.ip}:${router.port}/chains/zero/${table}`, {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': router.key
          }
        })
        if (response.status == 200) {
          console.log(`Zero all chains of table ${table} in firewall ${router.name} successfully `)
        } else if (response.status == 401) {
          throw new Error(`Invalid API key firewall ${router.name}`)
        } else {
          const body = await response.json()
          console.log(`Firewall ${router.name} - Table ${table}: ${body.message || 'Something is wrong, fail to zero.'}`)
        }
      } catch (error) {
        console.log(error.message || error)
      }
    }
    return
  }
  if (!table && chain) {
    table = 'filter'
  }
  if (table && chain) {
    for (const router of routers) {
      try {
        const response = await fetch(`http://${router.ip}:${router.port}/chains/zero/${table}/${chain}`, {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': router.key
          }
        })
        if (response.status == 200) {
          console.log(`Zero chain ${chain} of table ${table} in firewall ${router.name} successfully `)
        } else if (response.status == 401) {
          throw new Error(`Invalid API key firewall ${router.name}`)
        } else {
          const body = await response.json()
          console.log(`Firewall ${router.name} - Table ${table} - Chain ${chain}: ${body.message || 'Something is wrong, fail to zero.'}`)
        }
      } catch (error) {
        console.log(error.message || error)
      }
    }
  }
}

module.exports = zeroChain