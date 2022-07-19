const routerConfig = require('../../config/routers')
const ruleConfig = require('../../config/rules')

let routers = routerConfig.get('routers')

const addRouter = (options) => {
  const {ip, name} = options
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
  routers.push({
    ip, name
  })
  routerConfig.set('routers', routers)
  ruleConfig.set(name, {
    filter: {
      FORWARD: [],
      INPUT: [],
      OUTPUT: []
    },
    nat: {
      FORWARD: [],
      INPUT: [],
      OUTPUT: [],
      POSTROUTING: [],
      PREROUTING: []
    }
  })
  // console.log(router)
  return 'Add new router successfully'
}

module.exports = addRouter