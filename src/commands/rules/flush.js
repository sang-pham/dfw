const fetch = require('node-fetch')
const getRouterByOption = require('../../helper/getRouterByOption')

const flushRule = async (chain, options) => {
  let table = options['table']
  const routers = getRouterByOption(options)
  if (!routers.length) return
  if (!table && !chain) {
    for (const router of routers) {
      try {
        const response = await fetch(`http://${router.ip}:${router.port}/rules/flush`, {
          method: 'delete'
        })
        if (response.status == 200) {
          console.log(`Flush all rules in firewall ${router.name} successfully `)
        } else {
          console.log(response)
          const body = await response.json()
          console.log(`Firewall ${router.name}: ${body.message || 'Something is wrong, fail to flush.'}`)
        }
      } catch (error) {
        console.log(`Firewall ${router.name}: ${error.message || 'Something is wrong, fail to flush.'}`)
      }
    }
    return
  }
  if (table && !chain) {
    for (const router of routers) {
      try {
        const response = await fetch(`http://${router.ip}:${router.port}/rules/flush/${table}`, {
          method: 'delete'
        })
        if (response.status == 200) {
          console.log(`Flush all rules of table ${table} in firewall ${router.name} successfully `)
        } else {
          const body = await response.json()
          console.log(`Firewall ${router.name} - Table ${table}: ${body.message || 'Something is wrong, fail to flush.'}`)
        }
      } catch (error) {
        console.log(`Firewall ${router.name} - Table ${table}: ${error.message || 'Something is wrong, fail to flush.'}`)
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
        const response = await fetch(`http://${router.ip}:${router.port}/rules/flush/${table}/${chain}`, {
          method: 'delete'
        })
        if (response.status == 200) {
          console.log(`Flush all rules of chain ${chain} of table ${table} in firewall ${router.name} successfully `)
        } else {
          const body = await response.json()
          console.log(`Firewall ${router.name} - Table ${table} - Chain ${chain}: ${body.message || 'Something is wrong, fail to flush.'}`)
        }
      } catch (error) {
        console.log(`Firewall ${router.name} - Table ${table} - Chain ${chain}: ${error.message || 'Something is wrong, fail to flush.'}`)
      }
    }
  }
}

module.exports = flushRule