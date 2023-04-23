const fetch = require('node-fetch')
const routerConfig = require('../../config/routers')
const { checkValidNetwork } = require('../../lib/utils')
const bcrypt = require('bcrypt')
const constant = require('../../lib/constant')

let firewalls = routerConfig.get('routers')

const addRouter = async (options) => {
  let {ip, name, port, firewallSync, tableSync, chainSync, network, fixKey} = options
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
  let key = await new Promise((resolve, reject) => {
    bcrypt.hash(`${name}-${ip}`, constant.SALT_ROUNDS, (err, hash) => {
      if (err) {
        reject(err)
      } else {
        resolve(hash)
      }
    })
  })
  if (firewallSync.length) {
    let syncFirewalls = firewallSync.split(",")
    for (const rs of syncFirewalls) {
      if (!firewalls.find(r => r.name === rs)) {
        throw new Error(`Can't find firewall ${rs}`)
      }
    }
    try {
      if (syncFirewalls && syncFirewalls.length) {
        if(!fixKey) {
          throw new Error(`To sync rules when create new firewall, you temporarily need to generate new key before, add that key to firewall agent and restart the agent.\
          \nThis temporary key will be replaced with the new key when creaing firewall successfully.`)
        }
      }
    } catch (error) {
      console.log(error.message)
      return
    }
    syncFirewalls = syncFirewalls.map(firewall => firewalls.find(r => r.name === firewall))
    const defaultTables = ['filter', 'nat', 'mangle']
    let syncTables = tableSync.split(",")
    if (tableSync) {
      for (const table of syncTables) {
        if (!defaultTables.find(t => t == table)) {
          throw new Error(`Invalid table ${table}`)
        }
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
            res = await fetch(`http://${firewall.ip}:${firewall.port}/rules/${table}`, {
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': firewall.key
              }
            })
            if (res.status == 401) {
              throw new Error(`Invalid API key with firewall ${firewall.name}`)
            }
            data = await res.json()
            if (Object.keys(data)) {
              for (const chain in data) {
                if (defaultChains[table].find(item => item === chain)) {
                  console.log(`\t\t Start sync with chain ${chain}`)
                  try {
                    let res = await fetch(`http://${ip}:${port}/rules/${table}/${chain}`, {
                      method: 'post',
                      body: JSON.stringify({ data: data[chain].map(item => ({
                        ...item,
                        counters: undefined
                      })) }),
                      headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': fixKey
                      }
                    })
                    if (res.status == 401) {
                      throw new Error(`Invalid API key with firewall ${name}`)
                    }
                    console.log(`\t\t Complete sync with chain ${chain}`)
                  } catch (error) {
                    console.log(error.message || error)
                  }
                }
              }
            }
          } else {
            res = await fetch(`http://${firewall.ip}:${firewall.port}/rules/${table}`, {
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': firewall.key
              }
            })
            if (res.status == 401) {
              throw new Error(`Invalid API key with firewall ${firewall.name}`)
            }
            data = await res.json()
            for (const chain of syncChains) {
              console.log(`\t\t Start sync with chain ${chain}`)
              try {
                let res = await fetch(`http://${ip}:${port}/rules/${table}/${chain}`, {
                  method: 'post',
                  body: JSON.stringify({ data: data[chain].map(item => ({
                    ...item,
                    counters: undefined
                  })) }),
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': fixKey
                  }
                })
                if (res.status == 401) {
                  throw new Error(`Invalid API key with firewall ${name}`)
                }
                console.log(`\t\t Complete sync with chain ${chain}`)
              } catch (error) {
                console.log(error.message || error)
              }
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
    ip, name, port, network, key
  })
  routerConfig.set('routers', firewalls)
  console.log('Add new firewall successfully.\nPlease add the following keys to your firewall agent and restart if needed, this key will appear only once')
  console.log(key)
}

module.exports = addRouter