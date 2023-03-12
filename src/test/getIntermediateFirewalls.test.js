const utils = require('../lib/utils')

function main() {
  const firewalls = [
    {name: 'fw1', ip: '192.168.191.1', port: 5000, network: '192.168.191.0/24'},
    {name: 'fw2', ip: '192.168.191.2', port: 5000, network: '192.168.191.0/28'},
    {name: 'fw3', ip: '192.168.191.3', port: 5000, network: '192.168.191.0/27'},
    {name: 'fw4', ip: '192.168.191.4', port: 5000, network: '192.168.191.0/25'},
    {name: 'fw5', ip: '192.168.191.5', port: 5000, network: '192.168.191.0/26'},
    {name: 'fw6', ip: '192.168.191.6', port: 5000, network: '192.168.191.0/26'},
  ]

  console.log(utils.getIntermediateFirewalls(firewalls[0], firewalls[5], firewalls))
}

main()