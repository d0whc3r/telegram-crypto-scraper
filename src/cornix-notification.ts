import client, { getEntityById } from './client';
import { TelegramClient } from 'telegram';
import { Config, formatDate } from './config';
import { TotalList } from 'telegram/Helpers';
import { Message } from 'telegram/tl/custom/message';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import { EOL } from 'os';

let CLIENT: TelegramClient;

type ExtractDataType = {
  id: number;
  date: string;
  exchange: string;
  client: string;
  channel: string;
  symbol: string;
  status: string;
  reason: string;
  percent: number;
  btc: number;
  usd: number;
};

function extractData(messages: TotalList<Message>) {
  const tradeText =
    // eslint-disable-next-line security/detect-unsafe-regex
    /Exchange: (?<exchange>.*)\nClient: (?<client>.*)\nChannel: (?<channel>.*)\n\nSymbol: (?<symbol>.*)\nStatus: (?<status>.*)\nReason: (?<reason>.*)\n\nYou (?<action>lost|earned) (?<percent>\d+\.\d+)% \((?<btc>[\d.]+) BTC \/ (?<usd>[\d.]+) USD/gi;
  const extract: ExtractDataType[] = [];
  messages.forEach(({ id, date: timeDate = 0, message }) => {
    if (message) {
      tradeText.lastIndex = 0;
      const match = tradeText.exec(message);
      if (match?.length && match?.groups) {
        const {
          groups: { exchange, symbol, client: cornixClient, channel, status, action, btc, percent, reason, usd }
        } = match;
        const date = new Date(timeDate * 1000);

        const mul = action === 'lost' ? -1 : 1;
        const info = {
          id,
          date: formatDate(date),
          exchange,
          client: cornixClient,
          channel,
          symbol,
          status,
          reason,
          percent: +percent * mul,
          btc: +btc * mul,
          usd: +usd * mul
        };
        extract.push(info);
      }
    }
  });
  return extract;
}

function generateCsv(content: ExtractDataType[]) {
  const formattedText = content
    .map((e) => {
      let line = '"' + Object.values(e).join('","') + '"';
      if (Config.REPLACE_DOTS) {
        line = line.replace(/\./g, ',');
      }
      return line;
    })
    .join(EOL);
  const header = '"ID","Date","Exchange","Client","Channel","Symbol","Status","Reason","Percent","BTC","USD"';
  const date = formatDate(new Date()).replace(/ /g, '_').replace(/:/g, '');
  const filePath = path.join(Config.CSV_PATH, `cornix-out__${date}.csv`);
  mkdirp.sync(path.dirname(filePath));
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(filePath, [header, formattedText].join(EOL));
  console.log('csv:', filePath);
}

async function startParser() {
  const chat = await getEntityById(CLIENT, Config.CORNIX_NOTIFICATION_ID);
  if (!chat) {
    console.error('[!] Not found cornix notification bot', Config.CORNIX_NOTIFICATION_ID);
    return;
  }
  const messages = await CLIENT.getMessages(chat.entity, {
    limit: 500000
  });
  const content = extractData(messages);
  generateCsv(content);
}

function init() {
  void client()
    .then((cl) => {
      CLIENT = cl;
      return startParser();
    })
    .then(() => {
      process.exit(0);
    });
}

export default init;
