import scrap from './scrap';
import cornixNotification from './cornix-notification';
import { Command, Option } from 'commander';
import { version } from '../package.json';
import { Config } from './config';

const program = new Command();

type OptionsType = {
  id: string;
  hash: string;
  phone: string;
  dot?: boolean;
  cornix?: boolean;
  parse?: string;
  dump?: boolean;
};

program
  .version(version)
  .requiredOption('--id <telegram_id>', 'api ID to connect to telegram')
  .requiredOption('--hash <telegram_hash>', 'api HASH to connect to telegram')
  .requiredOption('--phone <telegram_phone>', 'phone associated to this telegram account')
  .option('-d, --dot', 'use dot as decimal separator')
  .option('-c, --cornix', 'parse messages from cornix notification bot')
  .option('-p, --parse <channels>', 'parse cornix messages from channels (list of channels with comma separated)')
  .addOption(new Option('--dump').hideHelp());

program.parse(process.argv);

const { dot, cornix, parse, id, hash, phone, dump } = program.opts<OptionsType>();

Config.API_ID = +id;
Config.API_HASH = hash;
Config.PHONE = phone;

Config.REPLACE_DOTS = !dot;
Config.DUMP_ACTIVE = !!dump;

if (cornix) {
  cornixNotification();
} else if (parse) {
  Config.INPUTS = parse.split(',').map((x) => parseInt(x, 10));
  scrap();
} else {
  program.help();
}
