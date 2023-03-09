const { isUserConfigChange, getUserCache, getToken } = require('./cache/user.cache')
const config = require('../../config.json')
const firewallConfig = require('../config/routers')
const constant = require('./constant')
require('dotenv').config()

const firewalls = firewallConfig.get('routers')
// const firewalls = [
//   {name: 'fw1', ip: '192.168.191.1', port: 5000, network: '192.168.191.0/24'}
// ]

const checkEnv = () => {
  const AUTH_URL = config['auth_url']
  const USERNAME = config['username']
  const USERID = config['user_id']
  const DOMAIN = config['domain']
  const PASSWORD = config['password']
  const PROJECT_ID = config['project_id']
  if (!AUTH_URL) {
    throw new Error('You must specify the AUTH_URL variable')
  }
  if (!PASSWORD) {
    throw new Error('You must specify your password')
  }
  if ((!USERID || !PROJECT_ID) && (!USERNAME || !DOMAIN)) {
    throw new Error('You must specify user ID and project ID or user name and domain')
  }
}

const checkCredentials = async () => {
  try {
    checkEnv()
    let obj = {
      username: config['username'],
      userId: config['user_id'],
      password: config['password'],
      domain: config['domain'],
      projectId: config['project_id']
    }
    let token = await getToken()
    let isConfigChange = await isUserConfigChange(obj)
    let userCache = await getUserCache()
    if (isConfigChange|| !userCache || !token) return false
    return true
  } catch (error) {
    throw error
  }
}

const checkValidNetwork = network => {
  if (!network) return false
  let arr = network.split('/')
  if (arr.length < 2) {
    return false
  } else {
    if (arr[1] < 0 || arr[1] > 32) return false
    if (!arr[0].match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/)) return false
  }
  return true
}

const ipNumber = (ipAddr) => {
  const ip = ipAddr.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ip) {
    return (+ip[1]<<24) + (+ip[2]<<16) + (+ip[3]<<8) + (+ip[4]);
  } else {
    throw new Error('Invalid Ip number')
  }
}

const ipMask = (maskSize) => {
  return -1 << (32 - maskSize)
}

const number2Ip = num => {
  if (isNaN(num) || num < 0 || num > 4294967295) {
    return null
  }
  let d = num%256;
  for (let i = 3; i > 0; i--) 
  { 
      num = Math.floor(num/256);
      d = num%256 + '.' + d;
  }
  return d
}

const ip2Number = ip => {
  return ipNumber(ip) >>> 0
}

const cidr2Range = (cidr) => {
  const range = []
  cidr = cidr.split('/')
  const _start = ip2Number(cidr[0])
  range[0] = number2Ip(_start)
  range[1] = number2Ip(Math.pow(2, 32 - cidr[1]) + _start - 1);
  return range
}

const checkIpInNetwork = ({ip, network}) => {
  let arr = network.split('/')
  if (arr.length < 2) {
    throw new Error(`Invalid network range ${network}`)
  }
  try {
    return (ipNumber(ip) & ipMask(arr[1])) == ipNumber(arr[0])
  } catch (error) {
    console.log(error)
  }
}

const checkNetworkRelations = ({net1, net2}) => {
  let arr1 = net1.split('/')
  if (arr1.length < 2) {
    throw new Error(`Invalid network range ${net1}`)
  }
  let arr2 = net2.split('/')
  if (arr2.length < 2) {
    throw new Error(`Invalid network range ${net2}`)
  }
  const [startIpNet1, endIpNet1] = cidr2Range(net1)
  const [startIpNet2, endIpNet2] = cidr2Range(net2)
  const startNet1 = ip2Number(startIpNet1)
  const startNet2 = ip2Number(startIpNet2)
  const endNet1 = ip2Number(endIpNet1)
  const endNet2 = ip2Number(endIpNet2)

  if (startNet1 == startNet2) {
    if (endNet1 == endNet2) {
      return `net1-${constant.NETWORK_RELATIONS.EQUAL}-net2`
    } else if (endNet1 < endNet2) {
      return `net1-${constant.NETWORK_RELATIONS.SUBSET}-net2`
    } else {
      return `net1-${constant.NETWORK_RELATIONS.SUPERSET}-net2`
    }
  } else if (startNet1 < startNet2) {
    if (endNet1 == endNet2 || endNet1 > endNet2) {
      return `net1-${constant.NETWORK_RELATIONS.SUPERSET}-net2`
    } else {
      return null
    }
  } else {
    if (endNet1 == endNet2 || endNet1 < endNet2) {
      return `net1-${constant.NETWORK_RELATIONS.SUBSET}-net2`
    } else {
      return null
    }
  }
}

const getSupersetNet = (network, firewalls) => {
  let result = []
  let arr = firewalls.filter(item => item.network != network)
  for (const item of arr) {
    let check = checkNetworkRelations({
      net1: network,
      net2: item.network
    })
    if (check == `net1-${constant.NETWORK_RELATIONS.SUBSET}-net2`) {
      result.push(item)
    }
  }
  return result
}

const findRelateInfoByIp = (ip, firewalls) => {
  let managedFirewall = null
  const equalFirewalls = []
  const superFirewalls = []

  let compareList = []
  for (const firewall of firewalls) {
    if(checkIpInNetwork({
      ip,
      network: firewall.network
    })) {
      compareList.push(firewall)
    }
  }
  if (compareList.length) {
    const rangeList = compareList.map(item => cidr2Range(item.network).map(i => ip2Number(i)))
    managedFirewall = compareList[0]
    let minRange = rangeList[0][1] - rangeList[0][0]
    for (let i = 1; i < rangeList.length; i++) {
      let tempRange = rangeList[i][1] - rangeList[i][0]
      if (tempRange < minRange) {
        managedFirewall = compareList[i]
        minRange = tempRange
      }
    }
  }
  
  if (managedFirewall) {
    for (const firewall of firewalls) {
      if (firewall.name == managedFirewall.name) continue
      if (firewall.network == managedFirewall.network) {
        equalFirewalls.push(firewall)
      } else {
        let checkRelation = checkNetworkRelations({
          net1: managedFirewall.network,
          net2: firewall.network
        })
        if (checkRelation == `net1-${constant.NETWORK_RELATIONS.SUBSET}-net2`) {
          superFirewalls.push(firewall)
        }
      }
    }
  }

  return {
    managedFirewall,
    equalFirewalls,
    superFirewalls
  }
}

const findRelateInfoByNetwork = (network, firewalls) => {
  let managedFirewall = null
  const equalFirewalls = []
  const superFirewalls = []

  let compareList = []
  for (const firewall of firewalls) {
    let checkRelation = checkNetworkRelations({
      net1: network,
      net2: firewall.network
    })
    if (checkRelation == `net1-${constant.NETWORK_RELATIONS.SUBSET}-net2`
     || checkRelation == `net1-${constant.NETWORK_RELATIONS.EQUAL}-net2`) {
      compareList.push(firewall)
    }
  }

  if (compareList.length) {
    const rangeList = compareList.map(item => cidr2Range(item.network).map(i => ip2Number(i)))
    managedFirewall = compareList[0]
    let minRange = rangeList[0][1] - rangeList[0][0]
    for (let i = 1; i < rangeList.length; i++) {
      let tempRange = rangeList[i][1] - rangeList[i][0]
      if (tempRange < minRange) {
        managedFirewall = compareList[i]
        minRange = tempRange
      }
    }
  }

  if (managedFirewall) {
    for (const firewall of firewalls) {
      if (firewall.name == managedFirewall.name) continue
      if (firewall.network == managedFirewall.network) {
        equalFirewalls.push(firewall)
      } else {
        let checkRelation = checkNetworkRelations({
          net1: managedFirewall.network,
          net2: firewall.network
        })
        if (checkRelation == `net1-${constant.NETWORK_RELATIONS.SUBSET}-net2`) {
          superFirewalls.push(firewall)
        }
      }
    }
  }

  return {
    managedFirewall,
    equalFirewalls,
    superFirewalls
  }
}

const getLargestFirewalls = function(firewalls) {
  const rangeList = firewalls.map(item => cidr2Range(item.network).map(i => ip2Number(i)))
  let maxRange = rangeList[0][1] - rangeList[0][0]
  let idx = 0
  for (let i = 1; i < rangeList.length; i++) {
    let tempRange = rangeList[i][1] - rangeList[i][0]
    if (tempRange > maxRange) {
      idx = i
      maxRange = tempRange
    }
  }
  return firewalls[idx]
}

const autoIdentifyFirewalls = (ruleOptions, chainName, tableName, firewalls) => {
  switch(tableName) {
    case 'nat':
      return identifyFirewalls4Nat(ruleOptions, chainName, firewalls)
    case 'filter':
    default:
      return identifyFirewalls4Filter(ruleOptions, chainName, firewalls)
  }
}

const identifyFirewalls4Filter = (ruleOptions, chainName, firewalls) => {
  switch(chainName) {
    case "INPUT":
      return identifyFw4FilterInput(ruleOptions, firewalls)
    case "OUTPUT":
      return identifyFw4FilterOutput(ruleOptions, firewalls)
    case "FORWARD":
      return identifyFw4FilterForward(ruleOptions, firewalls)
    default:
      return []
  }
}

const identifyFirewalls4Nat = (ruleOptions, chainName, firewalls) => {
}

const identifyFw4FilterInput = (ruleOptions) => {
  const {source, destination} = ruleOptions
}

const identifyFw4FilterOutput = (ruleOptions) => {

}

const identifyFw4FilterForward = (ruleOptions, firewalls) => {
  const {source, destination, jump: target} = ruleOptions

  const validFirewalls = firewalls.filter(item => item.network && checkValidNetwork(item.network))

  if (!source && !destination) {
    // In this case, return all firewalls
    return firewalls
  } else if (source && !destination) {
    let isSingleSource = constant.IP_REGEX.test(source)
    const result = []
    // managedFirewall <-> managed network - the MIN network that could be able to contain source IP(single or range)
    let managedFirewall = null, equalFirewalls = [], superFirewalls = []
    let infoResult = null
    if (isSingleSource) {
      infoResult = findRelateInfoByIp(source, validFirewalls)
    } else {
      infoResult = findRelateInfoByNetwork(source, validFirewalls)
    }
    managedFirewall = infoResult.managedFirewall
    equalFirewalls = infoResult.equalFirewalls
    superFirewalls = infoResult.superFirewalls
    // return all if not find any match firewalls
    if (!managedFirewall) {
      return firewalls
    }
    result.push(managedFirewall)
    /* 
      Push equal networks to result in the following cases:
      - target in ['DROP', 'REJECT',....]
      - maybe need to push in all cases if equal networks is not empty
      => NESTED NETWORKS  and 1 network/N firewals case
    */
    result.push(...equalFirewalls)
    /* 
      Push super networks(managed network is a subnet of some networks) to result in the following cases:
      - target == 'ACCEPT' AND super networks is not empty => NESTED NETWORKS case
    */
    if (target == constant.RULE_ACTION.ACCEPT && superFirewalls.length) {
      result.push(...superFirewalls)
    }
 
    return result
  } else if (!source && destination) {
    let isSingleDest = constant.IP_REGEX.test(destination)
    const result = []
    // managedFirewall <-> managed network - the MIN network that could be able to contain source IP(single or range)
    let managedFirewall = null, equalFirewalls = [], superFirewalls = []
    let infoResult = null
    if (isSingleDest) {
      infoResult = findRelateInfoByIp(destination, validFirewalls)
    } else {
      infoResult = findRelateInfoByNetwork(destination, validFirewalls)
    }
    managedFirewall = infoResult.managedFirewall
    equalFirewalls = infoResult.equalFirewalls
    superFirewalls = infoResult.superFirewalls
    // return all if not find any match firewalls
    if (!managedFirewall) {
      return firewalls
    }
    /* 
      Just add most super networks in the following cases:
      - target in ['DROP', 'REJECt'] and super network is not empty
    */
    if ((target == constant.RULE_ACTION.DROP || target == constant.RULE_ACTION.REJECT)
      && superFirewalls.length) {
        result.push(getLargestFirewalls(superFirewalls))
      }
    else {
      result.push(managedFirewall)
      result.push(...equalFirewalls)
      result.push(...superFirewalls)
    }
    return result
  } else {

  }
}

module.exports = {
  checkCredentials,
  checkEnv,
  autoIdentifyFirewalls,
  checkIpInNetwork,
  getSupersetNet,
  findRelateInfoByIp,
  findRelateInfoByNetwork
}