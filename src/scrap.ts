/* eslint-disable security/detect-non-literal-fs-filename */
import client from './client';
import { Api, TelegramClient } from 'telegram';
import { TotalList } from 'telegram/Helpers';
import { Dialog } from 'telegram/tl/custom/dialog';
import { Config } from './config';
import { Message } from 'telegram/tl/custom/message';
import { Parser } from './parser';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';

let CLIENT: TelegramClient;

async function scrapChat(chat: Dialog) {
  let messages: TotalList<Message>;
  let chatTitle = chat.name || 'unknown';
  if (chat.entity instanceof Api.Channel) {
    chatTitle = chat.entity.title;
  }
  const filePath = path.join(Config.DUMP_DIR, chatTitle.replace(/ /g, '_') + '.json');
  if (!Config.DUMP_ACTIVE || !fs.existsSync(filePath)) {
    messages = await CLIENT.getMessages(chat.entity, {
      limit: 50000
    });
    mkdirp.sync(path.dirname(filePath));
    const parsedMessages = messages.map(({ id, message, date, isReply, replyTo = {} }) => ({
      id,
      message,
      date,
      isReply,
      replyTo: { replyToMsgId: replyTo?.replyToMsgId }
    }));
    fs.writeFileSync(filePath, JSON.stringify(parsedMessages, null, 2));
  } else {
    messages = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as TotalList<Message>;
  }
  const parser = new Parser(messages, chatTitle, { replaceDots: Config.REPLACE_DOTS });
  const csv = parser.generateCSV();
  console.log('csv file:', csv);
  return csv;
}

async function startScraper() {
  const chats: TotalList<Dialog> = await CLIENT.getDialogs({ archived: false });
  let timeout = 0;
  return Promise.all(
    chats
      .filter((chat) => Config.INPUTS.includes(chat.id || 0))
      .map((chat) => {
        return new Promise<typeof chat>((resolve) => {
          setTimeout(() => {
            resolve(chat);
          }, timeout);
          timeout = Config.DUMP_ACTIVE ? 0 : timeout + 8000;
        }).then((chat2) => scrapChat(chat2));
      })
  );
}

function init() {
  void client
    .then((cl) => {
      CLIENT = cl;
      return startScraper();
    })
    .then(() => {
      process.exit(0);
    });
}

export default init;
