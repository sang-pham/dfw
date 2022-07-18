const routerConfig = require('../../config/routers')

let routers = routerConfig.get('routers')

const listRouters = (options) => {
  if (!routers || !routers.length) {
    throw new Error('No router config yet')
  }
  if (options['name']) {
    routers = routers.filter(item => item.name === options['name'])
  }
  if (options['ip']) {
    routers = routers.filter(item => item.ip === options['ip'])
  }
  if (routers.length) {
    console.log(routers.reduce((res, previousValue) => {
      return res + `${previousValue.name}\t\t${previousValue.ip}\n`
    }, "Name\t\tIp\n"))
  }
  return routers
}

module.exports = listRouters