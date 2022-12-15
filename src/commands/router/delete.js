const routerConfig = require('../../config/routers')

let routers = routerConfig.get('routers')

const deleteRouter = (options) => {
  let {ip, name} = options

  if (!routers || !routers.length) {
    return
  }
  if (ip && name) {
    routers = routers.filter(item => item.ip !== ip && item.name !== name)
    routerConfig.set('routers', routers)
    return
  }
  if (ip && !name) {
    routers = routers.filter(item => item.ip !== ip)
    routerConfig.set('routers', routers)
    return
  }
  if (!ip && name) {
    routers = routers.filter(item => item.name !== name)
    routerConfig.set('routers', routers)
    return
  }
}

module.exports = deleteRouter