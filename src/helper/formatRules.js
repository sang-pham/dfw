const formatRules = (data, options = {}) => {
  console.log('target\t\tprot\t\tsource\t\t\tdestination')
  for (const item of data) {
    let res = ''
    // res += `${item.target}\t\t${Object.keys(item.target[Object.keys(item.target)[0]])},${Object.values(item.target[Object.keys(item.target)[0]])}`
    res += `${Object.keys(item.target)[0]}\t\t`
    res += `${item.protocol || 'all'}\t\t`
    res += `${item.src || 'anywhere'}\t\t`
    res += `${item.dst || 'anywhere'}\t\t`
    if (item.target[Object.keys(item.target)[0]]) {
      res += `${Object.keys(item.target[Object.keys(item.target)[0]])},${Object.values(item.target[Object.keys(item.target)[0]])}`
    }
    console.log(res)
  }
}

module.exports = formatRules