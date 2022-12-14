const routerConfig = require('../../config/routers')
const getRouterByOption = require('../../helper/getRouterByOption')

let routers = routerConfig.get('routers')

const updateRouterPort = (options) => {
  try {
    const matchRouters = getRouterByOption(options)
    if (!matchRouters.length) {
      console.log("No firewall matches with options")
      return
    }
    const { port } = options
    for (const r of matchRouters) {
      let foundRouter = routers.find(_r => r.name === r.name)
      foundRouter.port = port
    }
    routerConfig.set('routers', routers)
    console.log('Update new port successfully')
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  updateRouterPort
}