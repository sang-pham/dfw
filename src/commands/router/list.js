const routerConfig = require('../../config/routers')
const fetch = require('node-fetch')

let routers = routerConfig.get('routers')

const listRouters = async (options) => {
  if (!routers || !routers.length) {
    console.log('No firewall config yet')
    return
  }
  if (options['name']) {
    routers = routers.filter(item => item.name === options['name'])
  }
  if (options['ip']) {
    routers = routers.filter(item => item.ip === options['ip'])
  }
  if (routers.length) {
    if (options.status) {
      console.log(await listRoutersWithStatus(routers))
      return
    }
    console.log(routers.reduce((res, previousValue) => {
      return res + `${previousValue.name}\t${previousValue.ip}\t${previousValue.port}\n`
    }, "Name\t\tIp\t\tPort\n"))
  }
  return routers
}

const listRoutersWithStatus = async (routers) => {
  let res = "Name\t\tIp\t\tPort\tStatus\n"
  for (const router of routers) {
    try {
      const response = await fetch(`http://${router.ip}:${router.port}/test-connection`)
      res += `${router.name}\t${router.ip}\t${router.port}\t${response.status == 200 ? 'Alive': 'Down'}`
    } catch (error) {
      res += `${router.name}\t${router.ip}\t${router.port}\tDown`
    }
  }
  return res
}

module.exports = listRouters