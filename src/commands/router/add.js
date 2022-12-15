const fetch = require('node-fetch')
const routerConfig = require('../../config/routers')

let routers = routerConfig.get('routers')

const addRouter = async (options) => {
  let {ip, name, port, routerSync, tableSync, chainSync} = options
  routerSync = routerSync || ''
  tableSync = tableSync || ''
  chainSync = chainSync || ''
  port = port || 5000
  const IP_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  if (!name) {
    throw new Error('Require router name')
  }
  if (!ip) {
    throw new Error('Required router ip')
  }
  if (!IP_REGEX.test(ip)) {
    throw new Error('Invalid IP address')
  }
  if (!routers) {
    routers = []
  }
  if (routers.find(r => r.name === name || r.ip === ip)) {
    throw new Error('Deplicate router name or router ip')
  }
  if (routerSync.length) {
    let syncRouters = routerSync.split(",")
    for (const rs of syncRouters) {
      if (!routers.find(r => r.name === rs)) {
        throw new Error(`Can't find router ${rs}`)
      }
    }
    syncRouters = syncRouters.map(router => routers.find(r => r.name === router))
    const defaultTables = ['filter', 'nat', 'mangle']
    let syncTables = tableSync.split(",")
    for (const table of syncTables) {
      if (!defaultTables.find(t => t == table)) {
        throw new Error(`Invalid table ${table}`)
      }
    }
    if (!tableSync) {
      syncTables = ['filter']
    }
    const defaultChains = {
      filter: ['INPUT', 'OUTPUT', 'FORWARD'],
      nat: ['INPUT', 'OUTPUT', 'PREROUTING', 'POSTROUTING'],
      mangle: ['PREROUTING', 'INPUT', 'FORWARD', 'OUTPUT', 'POSTROUTING']
    }
    const syncChains = chainSync.split(",")
    if (chainSync) {
      for (const table of syncTables) {
        for (const c of syncChains) {
          if (!defaultChains[table].find(item => item === c)) {
            throw new Error(`Invalid chain ${c} in table ${table}`)
          } 
        }
      }
    }
    try {
      let res, data;
      for (const router of syncRouters) {
        console.log(`Start sync with router ${router.name}'s rules`)
        for (const table of syncTables) {
          console.log(`\t Start sync with table ${table}`)
          if (!chainSync.length) {
            res = await fetch(`http://${router.ip}:${router.port}/rules/${table}`)
            data = await res.json()
            if (Object.keys(data)) {
              for (const chain in data) {
                if (defaultChains[table].find(item => item === chain)) {
                  console.log(`\t\t Start sync with chain ${chain}`)
                  await fetch(`http://${ip}:${router.port}/rules/${table}/${chain}`, {
                    method: 'post',
                    body: JSON.stringify({ data: data[chain].map(item => ({
                      ...item,
                      counters: undefined
                    })) }),
                    headers: {'Content-Type': 'application/json'}
                  })
                  console.log(`\t\t Complete sync with chain ${chain}`)
                }
              }
            }
          } else {
            res = await fetch(`http://${router.ip}:${router.port}/rules/${table}`)
            data = await res.json()
            for (const chain of syncChains) {
              console.log(`\t\t Start sync with chain ${chain}`)
              await fetch(`http://${ip}:${router.port}/rules/${table}/${chain}`, {
                method: 'post',
                body: JSON.stringify({ data: data[chain].map(item => ({
                  ...item,
                  counters: undefined
                })) }),
                headers: {'Content-Type': 'application/json'}
              })
              console.log(`\t\t Complete sync with chain ${chain}`)
            }
          }
          console.log(`\tComplete sync with table ${table}`)
        }
        console.log(`Complete sync with router ${router.name}'s rules`)
      }
      console.log('DONE')
    } catch (error) {
      console.log(error)
      throw new Error(error.message)
    }
  }
  routers.push({
    ip, name, port
  })
  routerConfig.set('routers', routers)
  console.log('Add new firewall successfully')
}

module.exports = addRouter