export class Config {
  static _API_ID = +(process.env.API_ID || 0);
  static _API_HASH = process.env.API_HASH || '';
  static _PHONE = process.env.PHONE || '';
  static _SESSION = process.env.SESSION || 'telegram_session';
  static _INPUTS = (process.env.INPUTS || '').split(',').map((x) => parseInt(x, 10));
  static _DOWNLOAD_PATH = process.env.DOWNLOAD_PATH || './zips';
  static _CSV_PATH = process.env.CSV_PATH || './csv';
  static _BINANCE_PRICES_URL =
    process.env.BINANCE_PRICES_URL ||
    'https://data.binance.vision/data/futures/um/daily/markPriceKlines/{symbol}/{interval}/{symbol}-{interval}-{date}.zip';
  static _REPLACE_DOTS = [true, 1, '1', 'true'].includes(process.env.REPLACE_DOTS || false);
  static _DUMP_ACTIVE = [true, 1, '1', 'true'].includes(process.env.DUMP_ACTIVE || false);
  static _DUMP_DIR = process.env.DUMP_DIR || './dump';
  static _CORNIX_NOTIFICATION_ID = parseInt(process.env.CORNIX_NOTIFICATION_ID || '605763187', 10);

  static get API_ID() {
    return this._API_ID;
  }

  static set API_ID(item) {
    this._API_ID = item;
  }

  static get API_HASH() {
    return this._API_HASH;
  }

  static set API_HASH(item) {
    this._API_HASH = item;
  }

  static get PHONE() {
    return this._PHONE;
  }

  static set PHONE(item) {
    this._PHONE = item;
  }

  static get SESSION() {
    return this._SESSION;
  }

  static set SESSION(item) {
    this._SESSION = item;
  }

  static get INPUTS() {
    return this._INPUTS;
  }

  static set INPUTS(item) {
    this._INPUTS = item;
  }

  static get DOWNLOAD_PATH() {
    return this._DOWNLOAD_PATH;
  }

  static set DOWNLOAD_PATH(item) {
    this._DOWNLOAD_PATH = item;
  }

  static get CSV_PATH() {
    return this._CSV_PATH;
  }

  static set CSV_PATH(item) {
    this._CSV_PATH = item;
  }

  static get BINANCE_PRICES_URL() {
    return this._BINANCE_PRICES_URL;
  }

  static set BINANCE_PRICES_URL(item) {
    this._BINANCE_PRICES_URL = item;
  }

  static get REPLACE_DOTS() {
    return this._REPLACE_DOTS;
  }

  static set REPLACE_DOTS(item) {
    this._REPLACE_DOTS = item;
  }

  static get DUMP_ACTIVE() {
    return this._DUMP_ACTIVE;
  }

  static set DUMP_ACTIVE(item) {
    this._DUMP_ACTIVE = item;
  }

  static get DUMP_DIR() {
    return this._DUMP_DIR;
  }

  static set DUMP_DIR(item) {
    this._DUMP_DIR = item;
  }

  static get CORNIX_NOTIFICATION_ID() {
    return this._CORNIX_NOTIFICATION_ID;
  }

  static set CORNIX_NOTIFICATION_ID(item) {
    this._CORNIX_NOTIFICATION_ID = item;
  }
}

export function formatDate(date?: Date, local = true) {
  if (!date) {
    return '';
  }
  if (local) {
    const day = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((d) => d.toString().padStart(2, '0')).join('-');
    const time = [date.getHours(), date.getMinutes(), date.getSeconds()].map((d) => d.toString().padStart(2, '0')).join(':');
    return `${day} ${time}`;
  }
  return date.toISOString().split('.')[0].replace('T', ' ');
}
