const utils = require('../lib/utils')

function main() {
  const firewalls = [
    {name: 'fw1', ip: '192.168.191.1', port: 5000, network: '192.168.191.0/24'},
    {name: 'fw2', ip: '192.168.191.2', port: 5000, network: '192.168.191.0/28'},
    {name: 'fw3', ip: '192.168.191.3', port: 5000, network: '192.168.191.0/29'},
  ]

  const network = '192.168.191.0/30'
  console.log(utils.findRelateInfoByNetwork(network, firewalls))
}

main()