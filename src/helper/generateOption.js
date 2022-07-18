const mappingKey = require('./mappingKey.json')

const generateOptions = (options) => {
  let res = ''
  for (const key in options) {
    if (mappingKey[key] && options[key]) {
      res += `-${mappingKey[key]} ${options[key]} `
    }
  }
  return res
}

module.exports = generateOptions