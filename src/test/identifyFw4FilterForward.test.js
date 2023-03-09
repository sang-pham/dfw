const utils = require('../lib/utils')
const constant = require('../lib/constant')

const firewalls = [
  {name: 'fw1', ip: '192.168.191.1', port: 5000, network: '192.168.191.0/24'},
  {name: 'fw2', ip: '192.168.191.2', port: 5000, network: '192.168.191.0/28'},
  {name: 'fw3', ip: '192.168.191.3', port: 5000, network: '192.168.191.0/25'},
]

const test1 = () => utils.autoIdentifyFirewalls({
  destination: '192.168.191.0/24',
  jump: 'ACCEPT'
}, 'FORWARD', 'filter', firewalls)


const test2 = () => utils.autoIdentifyFirewalls({
  source: '192.168.191.0/26',
  jump: constant.RULE_ACTION.ACCEPT
}, 'FORWARD', 'filter', firewalls)

const testUtils = (testNumber) => {
  const obj = {
    1: test1,
    2: test2
  }

  return obj[testNumber]
}

function main() {

  for (let i = 1; i <= 2; i++) {
    try {
      console.log(`Start test ${i}`)
      console.log(`Result of test ${i}: ${JSON.stringify(testUtils(i)())}`)
    } catch (error) {
      console.log(error)
    } finally {
      console.log(`End test ${i}\n`)
    }
  }
}

main()