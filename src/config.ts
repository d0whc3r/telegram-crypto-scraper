export class Config {
  static API_ID = +(process.env.API_ID || 0);
  static API_HASH = process.env.API_HASH || '';
  static PHONE = process.env.PHONE || '';
  static SESSION = process.env.SESSION || '';
  static INPUTS = (process.env.INPUTS || '').split(',').map((x) => Number(x));
  static DOWNLOAD_PATH = process.env.DOWNLOAD_PATH || './zips';
  static CSV_PATH = process.env.CSV_PATH || './csv';
  static BINANCE_PRICES_URL =
    process.env.BINANCE_PRICES_URL ||
    'https://data.binance.vision/data/futures/um/daily/markPriceKlines/{symbol}/{interval}/{symbol}-{interval}-{date}.zip';
  static REPLACE_DOTS = [true, 1, '1', 'true'].includes(process.env.REPLACE_DOTS || true);
  static DUMP_ACTIVE = [true, 1, '1', 'true'].includes(process.env.DUMP_ACTIVE || false);
  static DUMP_DIR = process.env.DUMP_DIR || './dump';
}
