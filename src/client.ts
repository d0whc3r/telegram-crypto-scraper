import fs from 'fs';
import mkdirp from 'mkdirp';
// @ts-ignore
import input from 'input';
import path from 'path';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Config } from './config';

const FILE_SESSION = path.resolve(__dirname, '../session', Config.SESSION);

function getSession() {
  if (!fs.existsSync(FILE_SESSION)) {
    return '';
  }
  return fs.readFileSync(FILE_SESSION, 'utf8').trim();
}

function saveSession(session: string) {
  mkdirp.sync(path.dirname(FILE_SESSION));
  fs.writeFileSync(FILE_SESSION, session);
}

async function init() {
  const stringSession = new StringSession(getSession());
  const client = new TelegramClient(stringSession, Config.API_ID, Config.API_HASH, { connectionRetries: 5 });
  await client.start({
    phoneNumber: Config.PHONE,
    password: async () => await input.text('Password: '),
    phoneCode: async () => await input.text('Code: '),
    onError: (err) => console.error(err)
  });
  saveSession(stringSession.save());
  return client;
}

export default init();
