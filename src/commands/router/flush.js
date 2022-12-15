const routerConfig = require('../../config/routers')

let routers = routerConfig.get('routers')

const flushRouter = () => {
  if (!routers || !routers.length) {
    return
  }
  routers.length = 0
  routerConfig.set('routers', routers)
  return;
}

module.exports = flushRouter;