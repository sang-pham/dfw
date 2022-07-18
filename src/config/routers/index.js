const Conf = require('conf');

const routerConfig = new Conf({
  cwd: 'src/config/routers'
});

module.exports = routerConfig