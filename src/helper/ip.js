const IP_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

const generateIpList = (options, key) => {
  let list = []
  if (options[key]) {
    list = options[key].split(',')
    if (list.length) {
      for (const ip of list) {
        if (!IP_REGEX.test(ip)) {
          throw new Error(`Ip address ${ip} is not valid`)
        }
      }
    }
  }
  return list
}

module.exports = {
  generateIpList,
}