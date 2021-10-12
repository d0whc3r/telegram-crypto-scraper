/* eslint-disable security/detect-non-literal-fs-filename */
import fs from 'fs';
import mkdirp from 'mkdirp';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import input from 'input';
import path from 'path';
import { sessions, TelegramClient } from 'telegram';
// import { StringSession } from 'telegram/sessions';
import { Config } from './config';

const { StringSession } = sessions;

const FILE_SESSION = path.join('./session', Config.SESSION);
let CLIENT: TelegramClient;

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
  if (!CLIENT) {
    console.log({
      API_ID: Config.API_ID,
      API_HASH: Config.API_HASH,
      PHONE: Config.PHONE
    });
    const stringSession = new StringSession(getSession());
    CLIENT = new TelegramClient(stringSession, Config.API_ID, Config.API_HASH, { connectionRetries: 5 });
    await CLIENT.start({
      phoneNumber: Config.PHONE,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
      password: async () => await input.text('Password: '),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
      phoneCode: async () => await input.text('Code: '),
      onError: (err) => console.error(err)
    });
    saveSession(stringSession.save());
  }
  return CLIENT;
}

async function _getEntityById(client: TelegramClient, id: number | number[]) {
  const chats = await client.getDialogs({ archived: false });
  return chats.filter((chat) => {
    const ids = Array.isArray(id) ? id : [id];
    return ids.includes(chat.id || 0);
  });
}

export async function getEntityById(client: TelegramClient, id: number) {
  const entity = await _getEntityById(client, id);
  if (entity?.length) {
    return entity[0];
  }
  return undefined;
}

export async function getEntitiesById(client: TelegramClient, ids: number[]) {
  return await _getEntityById(client, ids);
}

export default init;
