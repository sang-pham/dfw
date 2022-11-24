#! /usr/bin/env node

// const commander = require('commander')
// const program = new commander.Command()
const { program } = require('commander');
const addRouter = require('./src/commands/router/add')
const listsRouter = require('./src/commands/router/list')
const deleteRouter = require('./src/commands/router/delete')
const flushRouter = require('./src/commands/router/flush')
const { updateRouterPort } = require('./src/commands/router/update')

const appendRule = require('./src/commands/rules/append')
const deleteRule = require('./src/commands/rules/delete')
const insertRule = require('./src/commands/rules/insert')
const listRule = require('./src/commands/rules/list')

const newChain = require('./src/commands/chains/new')
const deleteChain = require('./src/commands/chains/delete')

const getPolicy = require('./src/commands/policies/get')
const updatePolicy = require('./src/commands/policies/update')

const addCommand = program
  .command('add')
  .description('Use help for more options with add')

addCommand
  .command('firewall')
  .description('Add new firewall')
  .option('-n, --name <string>', 'firewall unique name')
  .option('-ip, --ip <string>', 'firewall unique ip')
  .option('-p, --port <number>', 'port that the agent will run on')
  .option('--firewall-sync <string>', 'sync rule from a firewall or list of firewalls seperated by comma')
  .option('--table-sync <string>', 'list of tables for sync rules seperated by comma or ignore for sync all tables')
  .option('--chain-sync <string>', 'list of default chains for sync rules seperated by comma or ignore for sync all tables')
  .action(addRouter)

addCommand
  .command('chain')
  .argument('<chainName>')
  .option('-t, --table <string>', 'table to add chain (default: \`filter\`)')
  .option('-fn, --firewall-name <string>', 'firewall to add chain')
  .action(newChain)


const listCommand = program
  .command('list')
  .description('Use help for more options with list')

listCommand
  .command('firewall')
  .description('List config firewalls')
  .option('-n, --name <string>', 'exact firewall name')
  .option('-ip, --ip <string>', 'exact firewall ip')
  .action(listsRouter)

const deleteCommand = program
  .command('delete')
  .description('Use help for more options with delete')

deleteCommand
  .command('firewall')
  .description('Delete firewall')
  .option('-n, --name <string>', 'exact firewall name')
  .option('-ip, --ip <string>', 'exact firewall ip')
  .action(deleteRouter)

deleteCommand
  .command('chain')
  .argument('<chainName>')
  .option('-t, --table <string>', 'table to add chain (default: \`filter\`)')
  .option('-fn, --firewall-name <string>', 'firewall to add chain')
  .action(deleteChain)

const flushCommand = program
  .command('flush')
  .description('Use help for more options with flush')

flushCommand
  .command('firewall')
  .description('Flush all firewall config')
  .action(flushRouter)

// program.option('-j, --jump')

function loadRuleOption(command) {
  command.option('-j, --jump <string>', 'target for rule (may load target extension)')
  command.option('-p, --protocol <string>', 'protocol: by name, eg. \`tcp\`')
  command.option('-s, --source <string>', 'source specification: list of address[/mask][...] separated by comma')
  command.option('-d, --destination <string>', 'destination specification: list of address[/mask][...] separated by comma')
  command.option('-sport, --source-port <string>', 'source port number specification')
  command.option('-dport, --destination-port <string>', 'source port number specification')
  command.option('-i, --in-interface <string>', 'network interface name ([+] for wildcard) or list separate by comma')
  command.option('-o, --out-interface <string>', 'network interface name ([+] for wildcard) or list separate by comma')
  command.option('-t, --table <string>', 'table to manipulate (default: \`filter\`)')
  command.option('-fn, --firewall-name <string>', 'List of firewall by name that rule will be sent to')
  command.option('-fip, --firewall-ip <string>', 'List of firewall by ip that rule will be sent to')
}

const appendRuleCommand = program
  .command('A')
  .description('Append rule to specific chain')
  .argument('<chain>')
  .action(appendRule)

loadRuleOption(appendRuleCommand)

const deleteRuleCommand = program
  .command('D')
  .description('Delete rule from specific chain')
  .argument('<chain>')
  .argument('[rule-order]', 'Optional rule order, value 0 means delete all rules in chain')
  .action(deleteRule)

loadRuleOption(deleteRuleCommand)

const insertRuleCommand = program
  .command('I')
  .description('Insert rule to specific chain')
  .argument('<chain>')
  .argument('[rule-order]')
  .action(insertRule)

loadRuleOption(insertRuleCommand)

const listRuleCommand = program
  .command('L')
  .description('List all rule. Options: by firewall/table/chain')
  .argument('[chain]')
  .option('-fn, --firewall-name <string>', 'List of rule in firewall by name')
  .option('-fip, --firewall-ip <string>', 'List of rule in firewall by ip')
  .option('-t, --table <string>', 'List of rule in table (default: \`filter\`)')
  .option('--line-numbers', 'List with rule order')
  .action(listRule)

const getCommand = program.command('get').description('Use -h for more information for get command')

getCommand
  .command('policy')
  .description('Get policy from specific chain')
  .argument('<chain>')
  .option('-fn, --firewall-name <string>', 'exact firewall name')
  .option('-fip, --firewall-ip <string>', 'exact firewall ip')
  .option('-t, --table <string>', 'List of rule in table (default: \`filter\`)')
  .action(getPolicy)

const updateCommand = program.command('update').description('Use -h for more information for update command')

updateCommand
  .command('policy')
  .description('Update policy for specific chain')
  .argument('<chain>')
  .argument('<new-policy>')
  .option('-fn, --firewall-name <string>', 'exact firewall name')
  .option('-fip, --firewall-ip <string>', 'exact firewall ip')
  .option('-t, --table <string>', 'List of rule in table (default: \`filter\`)')
  .action(updatePolicy)

updateCommand
  .command('firewall')
  .description('Update configuration for specific firewall')
  .option('-fn, --firewall-name <string>', 'exact firewall name need to update')
  .option('-fip, --firewall-ip <string>', 'exact firewall ip need to update')
  .option('-p, --port <number>', 'new port that agent will run on')
  .action(updateRouterPort)

try {
  program.parse();
} catch (err) {
  if (err) {
    console.log(err.message)
  }
}