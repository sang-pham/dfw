const routerConfig = require('../../config/routers')
const ruleConfig = require('../../config/rules')

let routers = routerConfig.get('routers')

const flushRouter = () => {
  if (!routers || !routers.length) {
    return
  }
  for (const router of routers) {
    ruleConfig.delete(router.name)
  }
  routers.length = 0
  routerConfig.set('routers', routers)
  return;
}

module.exports = flushRouter;