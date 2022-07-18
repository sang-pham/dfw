const routerConfig = require('../config/routers')
const IP_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

let routers = routerConfig.get('routers')

const getRouterByOption = (options) => {
  let routerNameList = []
  let routerIpList = []
  let filterRouters = []

  if (!routers || !routers.length) {
    throw new Error('No router config yet')
  }

  if (!options['routerName'] && !options['routerIp']) {
    return routers
  }
  if (options['routerName'] && !options['routerIp']) {
    routerNameList = options['routerName'].split(',').filter(item => !!item)
    for (const name of routerNameList) {
      if (!routers.find(router => router.name === name)) {
        throw new Error(`Not found router with name ${name}`)
      }
    }
    filterRouters = routers.filter(item => routerNameList.indexOf(item.name) >= 0) 
  } else if (!options['routerName'] && options['routerIp']) {
    routerIpList = options['routerIp'].split(',').filter(item => !!item)
    if (routerIpList.some(ip => !IP_REGEX.test(ip))) {
      throw new Error('Invalid router ip')
    }
    for (const ip of routerIpList) {
      if (!routers.find(router => router.ip === ip)) {
        throw new Error(`Not found router with ip ${ip}`)
      }
    }
    filterRouters = routers.filter(item => routerIpList.indexOf(item.ip) >= 0) 
  } else if (options['routerName'] && options['routerIp']) {
    routerNameList = options['routerName'].split(',').filter(item => !!item)
    routerIpList = options['routerIp'].split(',').filter(item => !!item)
    if (routerIpList.some(ip => !IP_REGEX.test(ip))) {
      throw new Error('Invalid router ip')
    }
    for (const name of routerNameList) {
      if (!routers.find(router => router.name === name)) {
        throw new Error(`Not found router with name ${name}`)
      }
    }
    for (const ip of routerIpList) {
      if (!routers.find(router => router.ip === ip)) {
        throw new Error(`Not found router with ip ${ip}`)
      }
    }
    filterRouters = routers.filter(item => routerIpList.indexOf(item.ip) >= 0 && routerNameList.indexOf(item.name) >= 0) 
  }
  return filterRouters;
}

module.exports = getRouterByOption