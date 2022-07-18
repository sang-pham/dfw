const Conf = require('conf');

const ruleConfig = new Conf({
  cwd: 'src/config/rules'
});

module.exports = ruleConfig