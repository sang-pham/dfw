const formatRules = (data, options = {}) => {
  let withLineNumber = options['lineNumbers']
  if (withLineNumber) {
    console.log('num\ttarget\t\tprot\t\tsource\t\t\tdestination\t\tin\t\tout')
  } else {
    console.log('target\t\tprot\t\tsource\t\t\tdestination\t\tin\t\tout')
  }
  let i = 1
  for (const item of data) {
    let res = ''
    if (withLineNumber) {
      res += `${i}\t`
    }
    if (typeof item.target == 'string') {
      res += `${item.target}\t\t`
    } else if (typeof item.target == 'object') {
      res += `${Object.keys(item.target)}\t\t`
    } else {
      res += '\t\t'
    }
    res += `${item.protocol || 'all'}\t\t`
    res += `${item.src || 'anywhere'}\t\t`
    res += `${item.dst || 'anywhere'}\t\t`
    res += `${item['in-interface'] || '*'}\t\t`
    res += `${item['out-interface'] || '*'}\t\t`
    if (Object.keys(item.target) == 'REJECT') {
      const rejectMessObj = item.target['REJECT']
      if (Object.keys(rejectMessObj).length) {
        for (const key in rejectMessObj) {
          res += `${key} ${rejectMessObj[key]}\t`
        }
      }
    }
    if (item.conntrack && item.conntrack.ctstate) {
      res += `${item.conntrack.ctstate}\t`
    }
    let protocol = item.protocol
    if (item[protocol] && Object.keys(item[protocol]).length) {
      for (let key in item[protocol]) {
        res += `${key}:${item[protocol][key]}`
      }
    }
    console.log(res)
    i++
  }
  console.log('\n')
}

module.exports = formatRules