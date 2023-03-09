#! /usr/bin/env node

// const commander = require('commander')
// const program = new commander.Command()

// require('dotenv').config()

const { program } = require('commander')
const addRouter = require('./src/commands/router/add')
const listRouters = require('./src/commands/router/list')
const deleteRouter = require('./src/commands/router/delete')
const flushRouter = require('./src/commands/router/flush')
const { updateFirewall } = require('./src/commands/router/update')

const appendRule = require('./src/commands/rules/append')
const deleteRule = require('./src/commands/rules/delete')
const insertRule = require('./src/commands/rules/insert')
const listRule = require('./src/commands/rules/list')
const flushRule = require('./src/commands/rules/flush')
const { dumpRules } = require('./src/commands/rules/dump') 
const importRules = require('./src/commands/rules/import')

const newChain = require('./src/commands/chains/new')
const deleteChain = require('./src/commands/chains/delete')
const zeroRule = require('./src/commands/chains/zero')

const getPolicy = require('./src/commands/policies/get')
const updatePolicy = require('./src/commands/policies/update')

const addNetwork = require('./src/commands/networks/new')
const listNetwork = require('./src/commands/networks/list')

const { authWrapper } = require('./src/lib/keystone')

// const ruleInsertHook = require('./src/hooks/rule-insert')

program
  .name('dfw')
  .description('Multiple(Distributed) firewall management CLI tool')
  .version('1.0.0')

// FIREWALL COMMANDS
const firewallCommand = program
  .command('firewall')
  .description('Use -h for more options with firewall command')

firewallCommand
  .command('add')
  .description('Add new firewall. You can use network options to specify the managed network.')
  .option('-n, --name <string>', 'firewall unique name')
  .option('-ip, --ip <string>', 'firewall unique ip')
  .option('-p, --port <number>', 'port that the agent will run on')
  .option('-n, --network <string>', 'Specify network managed by this new firewall.')
  .option('--firewall-sync <string>', 'sync rule from a firewall or list of firewalls seperated by comma')
  .option('--table-sync <string>', 'list of tables for sync rules seperated by comma or ignore for sync all tables')
  .option('--chain-sync <string>', 'list of default chains for sync rules seperated by comma or ignore for sync all tables')
  .action(addRouter)

firewallCommand
  .command('list')
  .description('List config firewalls')
  .option('--status', 'Use this option to check firewall agent status')
  .option('-n, --name <string>', 'exact firewall name')
  .option('-ip, --ip <string>', 'exact firewall ip')
  .action(listRouters)

firewallCommand
  .command('delete')
  .description('Delete firewall')
  .option('-n, --name <string>', 'exact firewall name')
  .option('-ip, --ip <string>', 'exact firewall ip')
  .action(deleteRouter)

firewallCommand
  .command('flush')
  .description('Flush all firewall config')
  .action(flushRouter)

firewallCommand
  .command('update')
  .description('Update configuration for specific firewall')
  .option('-fn, --firewall-name <string>', 'exact firewall name that need to update')
  .option('-fip, --firewall-ip <string>', 'exact firewall ip that need to update')
  .option('-p, --port <number>', 'new port that agent will run on')
  .option('-n, --network <string>', 'Specify new network managed by this firewall.')
  .action(updateFirewall)

// NETWORK COMMANDS 
const networkComamnd = program
  .command('network')
  .description('Use -h for more options with firewall command')

networkComamnd
  .command('add')
  .action(options => authWrapper(() => addNetwork(options)))

networkComamnd
  .command('list')
  .option('--external', 'List external networks')
  .option('--internal', 'List internal networks')
  .option('--name <string>', 'List networks according to their name')
  .option('--enable', 'List enabled networks')
  .option('--disable', 'List disabled networks')
  .option('--share', 'List networks shared between projects')
  .option('--no-share', 'List networks not shared between projects')
  .option('--status [string]', 'List networks according to their status (\'ACTIVE\', \'BUILD\', \'DOWN\', \'ERROR\')')
  .action(options => authWrapper(() => listNetwork(options)))

// CHAIN COMMANDS
const chainCommand = program
  .command('chain')
  .description('Use -h for more options with chain command')

chainCommand
  .command('add')
  .argument('<chainName>')
  .option('-t, --table <string>', 'table to add chain (default: \`filter\`)')
  .option('-fn, --firewall-name <string>', 'firewall to add chain')
  .option('-fip, --firewall-ip <string>', 'exact firewall ip need to update')
  .action(newChain)

chainCommand
  .command('delete')
  .argument('<chainName>')
  .option('-t, --table <string>', 'table to add chain (default: \`filter\`)')
  .option('-fn, --firewall-name <string>', 'firewall to delete chain')
  .option('-fip, --firewall-ip <string>', 'exact firewall ip need to update')
  .option('-f, --flush', 'Flush all rules before delete chain')
  .action(deleteChain)

chainCommand
  .command('get-policy')
  .description('Get policy from specific chain')
  .argument('<chain>')
  .option('-fn, --firewall-name <string>', 'exact firewall name')
  .option('-fip, --firewall-ip <string>', 'exact firewall ip')
  .option('-t, --table <string>', 'Table name to get policy (default: \`filter\`)')
  .action(getPolicy)

chainCommand
  .command('update-pocily')
  .description('Update policy for specific chain')
  .argument('<chain>')
  .argument('<new-policy>')
  .option('-fn, --firewall-name <string>', 'exact firewall name')
  .option('-fip, --firewall-ip <string>', 'exact firewall ip')
  .option('-t, --table <string>', 'Table name to update policy (default: \`filter\`)')
  .action(updatePolicy)

// RULE MANAGEMENT COMMAND
function loadRuleOption(command, callbacks) {
  command.option('-j, --jump <string>', 'target for rule (may load target extension)')
  command.option('-p, --protocol [string]', 'protocol: by name, eg. \`tcp\`')
  command.option('-s, --source [string]', 'source specification: list of address[/mask][...] separated by comma')
  command.option('-d, --destination <string>', 'destination specification: list of address[/mask][...] separated by comma')
  command.option('-sport, --source-port [string]', 'source port number specification')
  command.option('-dport, --destination-port [string]', 'source port number specification')
  command.option('-i, --in-interface [string]', 'network interface name ([+] for wildcard) or list separate by comma')
  command.option('-o, --out-interface [string]', 'network interface name ([+] for wildcard) or list separate by comma')
  command.option('-t, --table [string]', 'table to manipulate (default: \`filter\`)')
  command.option('-fn, --firewall-name <string>', 'List of firewall by name to filter')
  command.option('-fip, --firewall-ip <string>', 'List of firewall by ip to filter')
  if (callbacks && callbacks.length) {
    for (const c of callbacks) {
      c(command)
    }
  }
}

function loadModuleOption(command) {
  command.option('-m <string>', 'Specify the module name')
}

function loadStateManagementOption(command) {
  const prevOptions = command.options.map(item => item.short)
  const hasModuleOption = prevOptions.includes('-m')
  if (hasModuleOption) {
    command.option('--state <string>', 'List of connection state separated by command, which can be: NEW, ESTABLISHED, RELATED, INVALID')
  }
}

function loadConnTrackOption(command) {
  const prevOptions = command.options.map(item => item.short)
  let hasModuleOption = prevOptions.includes('-m')
  if (hasModuleOption) {
    command.option('--ctstate <string>', 'List of connection state separated by command, which can be: NEW, ESTABLISHED, RELATED, INVALID')
  }
}

const appendRuleCommand = program
  .command('A')
  .description('Append rule to specific chain')
  .argument('<chain>')
  // .option('-fn, --firewall-name <string>', 'exact firewall name or list seperated by comma')
  // .option('-fip, --firewall-ip <string>', 'exact firewall ip or list seperated by comma')
  // .option('-t, --table <string>', 'Table name to update policy (default: \`filter\`)')
  .action(appendRule)

loadRuleOption(appendRuleCommand, [loadModuleOption, loadStateManagementOption])

const deleteRuleCommand = program
  .command('D')
  .description('Delete rule from specific chain')
  .argument('<chain>')
  .argument('[rule-order]', 'Optional rule order, value 0 means delete all rules in chain')
  .action(deleteRule)

loadRuleOption(deleteRuleCommand)

const flushRuleCommand = program
  .command('F')
  .description('Flush rules for specific chain, table or all')
  .argument('[chain]')
  .option('-t, --table [string]', 'table to manipulate (default: \`filter\`)')
  .option('-fn, --firewall-name <string>', 'List of firewall by name to filter')
  .option('-fip, --firewall-ip <string>', 'List of firewall by ip to filter')
  .action(flushRule)

const zeroRuleCommand = program
  .command('Z')
  .description('Zero packet and byte counters for specific chain, table or all')
  .argument('[chain]')
  .option('-t, --table [string]', 'table to manipulate (default: \`filter\`)')
  .option('-fn, --firewall-name <string>', 'List of firewall by name to filter')
  .option('-fip, --firewall-ip <string>', 'List of firewall by ip to filter')
  .action(zeroRule)

const insertRuleCommand = program
  .command('I')
  .description('Insert rule to specific chain')
  .argument('<chain>')
  .argument('[rule-order]')
  // .hook('preAction', ruleInsertHook.preActionInsert)
  .action(insertRule)

loadRuleOption(insertRuleCommand, [loadModuleOption, loadStateManagementOption])

const listRuleCommand = program
  .command('L')
  .description('List all rule. Options: by firewall/table/chain')
  .argument('[chain]')
  .option('-fn, --firewall-name <string>', 'List of rule in firewall by name')
  .option('-fip, --firewall-ip <string>', 'List of rule in firewall by ip')
  .option('-t, --table <string>', 'List of rule in table (default: \`filter\`)')
  .option('--line-numbers', 'List with rule order')
  .action(listRule)

//DUMP command
const dumpCommand = program
  .command('dump')
  .description('Use -h for more options with dump command')

dumpCommand
  .command('rules')
  .description('Dump rules to file')
  .option('-fn, --firewall-name <string>', 'List of firewall name to filter.')
  .option('-fip, --firewall-ip <string>', 'List of firewall ip to filter.')
  .option('-c, --counters', 'Keep track the byte and packet counter values')
  .option('-t, --table <string>', 'Indicate which table to save that contains rules and chains. By default, all the tables are saved.')
  .option('--save', 'Allow to save rules to file with path')
  .option('-p, --path <string>', 'File path will be saved. By default, path is the location command running at')
  .action(dumpRules)

//IMPORT command
const importCommand = program
  .command('import')
  .description('Use -h for more options with import command')

importCommand
  .command('rules')
  .description('Import rules from file to firewall(s)')
  .option('-fn, --firewall-name <string>', 'List of firewall name whose rules will be imported.')
  .option('-fip, --firewall-ip <string>', 'List of firewall ip whose rules will be imported.')
  .option('-c, --counters', 'Keep track the byte and packet counter values')
  .option('-t, --table <string>', 'Indicate which table to import that contains rules and chains. By default, all the tables will be imported.')
  .option('-n, --noflush', 'Don\'t flush rules before import.')
  .option('-p, --path <string>', 'File path contains rules to import.')
  .action(importRules)

try {
  program.parse();
} catch (err) {
  if (err) {
    console.log(err.message)
  }
}