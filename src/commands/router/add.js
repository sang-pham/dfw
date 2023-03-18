const fetch = require('node-fetch')
const routerConfig = require('../../config/routers')
const { checkValidNetwork } = require('../../lib/utils')

let firewalls = routerConfig.get('routers')

const addRouter = async (options) => {
  let {ip, name, port, firewallSync, tableSync, chainSync, network} = options
  firewallSync = firewallSync || ''
  tableSync = tableSync || ''
  chainSync = chainSync || ''
  port = port || 5000
  network = network || ''
  const IP_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  try {
    if (!name) {
      throw new Error('Require firewall name')
    } else if (name.length > 16) {
      throw new Error('Firewall name must in length 16')
    }
    if (!ip) {
      throw new Error('Required firewall ip')
    }
    if (!IP_REGEX.test(ip)) {
      throw new Error('Invalid IP address')
    }
    if (network) {
      if (!checkValidNetwork(network)) {
        throw new Error('Invalid network ip')
      }
    }
    if (!firewalls) {
      firewalls = []
    }
    if (firewalls.find(r => r.name === name || r.ip === ip)) {
      throw new Error('Deplicate firewall name or firewall ip')
    }
  } catch (error) {
    console.log(error.message)
    return
  }
  if (firewallSync.length) {
    let syncFirewalls = firewallSync.split(",")
    for (const rs of syncFirewalls) {
      if (!firewalls.find(r => r.name === rs)) {
        throw new Error(`Can't find firewall ${rs}`)
      }
    }
    syncFirewalls = syncFirewalls.map(firewall => firewalls.find(r => r.name === firewall))
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
      for (const firewall of syncFirewalls) {
        console.log(`Start sync with firewall ${firewall.name}'s rules`)
        for (const table of syncTables) {
          console.log(`\t Start sync with table ${table}`)
          if (!chainSync.length) {
            res = await fetch(`http://${firewall.ip}:${firewall.port}/rules/${table}`)
            data = await res.json()
            if (Object.keys(data)) {
              for (const chain in data) {
                if (defaultChains[table].find(item => item === chain)) {
                  console.log(`\t\t Start sync with chain ${chain}`)
                  await fetch(`http://${ip}:${firewall.port}/rules/${table}/${chain}`, {
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
            res = await fetch(`http://${firewall.ip}:${firewall.port}/rules/${table}`)
            data = await res.json()
            for (const chain of syncChains) {
              console.log(`\t\t Start sync with chain ${chain}`)
              await fetch(`http://${ip}:${firewall.port}/rules/${table}/${chain}`, {
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
        console.log(`Complete sync with firewall ${firewall.name}'s rules`)
      }
      console.log('DONE')
    } catch (error) {
      console.log(error)
      throw new Error(error.message)
    }
  }
  firewalls.push({
    ip, name, port, network
  })
  routerConfig.set('routers', firewalls)
  console.log('Add new firewall successfully')
}

module.exports = addRouter