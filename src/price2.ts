/* eslint-disable @typescript-eslint/ban-ts-comment */
// global.fetch = require('node-fetch')
// @ts-ignore
import nodeFetch from 'node-fetch';
// @ts-ignore
import { fetchPrice } from '@exodus/prices';
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
global.fetch = nodeFetch;

// const t1 = new Date('2017-01-10 12:25 CST')

async function getPrice(symbol: string, base: string, time: Date) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
  return await fetchPrice(symbol, base, time);
}

// console.log(btcPrice.toFixed(2)) // => 903.30

void getPrice('BTC', 'USDT', new Date(2021, 5, 19, 10, 10)).then(console.log);

export default getPrice;
