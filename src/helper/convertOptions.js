const dfwOptions2RuleObj = (options) => {
  let res = {}
  for (const [key, value] of Object.entries(options)) {
    switch(key) {
      case 'jump':
        res['target'] = value;
        continue;
      case 'protocol':
        res['protocol'] = value;
        res[value] = {}
        continue;
      case 'source':
        res['src'] = value;
        continue;
      case 'destination':
        res['dst'] = value;
        continue;
      case "inInterface":
        res['in_interface'] = value;
        continue;
      case "outInterface":
        res['out_interface'] = value;
        continue;
      case "sourcePort":
        if (!options['protocol']) {
          throw new Error('Protocol match must be specific')
        }
        res[options['protocol']] = res[options['protocol']] || {}
        res[options['protocol']]['sport'] = value
        continue;
      case "destinationPort":
        if (!options['protocol']) {
          throw new Error('Protocol match must be specific')
        }
        res[options['protocol']] = res[options['protocol']] || {}
        res[options['protocol']]['dport'] = value
        continue;
      case "m":
        res['module'] = value
        res['m'] = value
        // if (value == 'conntrack') {
        //   res['conntrack'] = options['ctstate']
        //   res['state'] = 'conntrack'
        // }
        continue;
      case "state":
        if (!options['m'] || options['m'] != 'state') {
          throw new Error('No specify or invalid module name')
        }
        res['state'] = value
        continue;
      // case "ctstate":
      //   if (!options['m'] || options['m'] != 'conntrack') {
      //     throw new Error('No specify or invalid module name')
      //   }
      //   res['ctstate'] = value
      //   continue;
    }
  }
  return res
}

module.exports = {
  dfwOptions2RuleObj
}