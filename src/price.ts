import { Config } from './config';
import axios from 'axios';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import { Stream } from 'stream';

type BasicInfo = {
  symbol: string;
  date: Date;
  interval: string;
};

function generateDay(date: Date) {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

function generateUrl({ symbol, interval, date }: BasicInfo) {
  return Config.BINANCE_PRICES_URL.replace(/{symbol}/g, symbol)
    .replace(/{date}/g, generateDay(date))
    .replace(/{interval}/g, interval);
}

function generateFilePath({ symbol, interval, date }: BasicInfo) {
  const basePath = Config.DOWNLOAD_PATH;
  mkdirp.sync(basePath);
  return path.join(basePath, `${symbol}-${interval}-${generateDay(date)}.zip`);
}

function existFile(info: BasicInfo) {
  const filePath = generateFilePath(info);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return fs.existsSync(filePath);
}

function downloadZipFile(info: BasicInfo) {
  if (existFile(info)) {
    return true;
  }
  const filename = generateFilePath(info);
  const url = generateUrl(info);
  console.log('url', url);
  return axios.get<Stream>(url, { responseType: 'stream' }).then((response) => {
    response.data.pipe(fs.createWriteStream(filename));
    return new Promise((resolve, reject) => {
      response.data.on('end', () => {
        resolve(filename);
      });

      response.data.on('error', (error) => {
        reject(error);
      });
    });
  });
}

async function getPrice(base: string, quote: string, date: Date) {
  const symbol = base + quote;
  const file = await downloadZipFile({ symbol, interval: '1m', date });
  console.log('file', file);
}

void getPrice('BTC', 'USDT', new Date(2021, 5, 19, 12, 10)).then(console.log);

export default getPrice;
