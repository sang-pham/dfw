const routerConfig = require('../../config/routers')
const getRouterByOption = require('../../helper/getRouterByOption')

let routers = routerConfig.get('routers')

const updateFirewall = (options) => {
  try {
    const matchRouters = getRouterByOption(options)
    if (!matchRouters.length) {
      console.log("No firewall matches with options")
      return
    }
    const { port, network } = options
    for (const r of matchRouters) {
      let foundRouter = routers.find(_r => r.name === r.name)
      if (port) {
        foundRouter.port = port
      }
      if (network) {
        foundRouter.network = network
      }
    }
    routerConfig.set('routers', routers)
    console.log('Update firewall successfully')
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  updateFirewall
}