/* eslint-disable security/detect-unsafe-regex */
import { TotalList } from 'telegram/Helpers';
import { Message } from 'telegram/tl/custom/message';
import fs from 'fs';
import path from 'path';
import { Config } from './config';
import mkdirp from 'mkdirp';

type ParseOptions = {
  replaceDots?: boolean;
};

enum Position {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

type OperationInfo = {
  id: number;
  pair: string;
  position: Position;
};

type TrackingInfo = OperationInfo & {
  entryDate: Date;
  closeDate?: Date;
  reversed?: boolean;
  leverage: number;
  entryPrice: number;
  tpsPrice: number[];
  slPrice: number;
  tpsDate?: Date[];
  tps: boolean[];
  slDate?: Date;
  sl: boolean;
  tpsPercent?: number[];
  slPercent?: number;
  open?: boolean;
  closedBy?: number;
};

type TrackingPairsLogger = {
  last: Map<string, OperationInfo>;
  track: Map<string, TrackingInfo>;
};

type CalculateInfoType = Pick<TrackingInfo, 'tps' | 'sl' | 'tpsPercent' | 'slPercent' | 'open' | 'reversed'>;
type CalculateInfoSlType = Pick<TrackingInfo, 'slPrice' | 'entryPrice' | 'leverage' | 'position'>;
type CalculateInfoProfitsType = Pick<CalculateInfoType, 'tpsPercent' | 'slPercent' | 'tps'>;
type CalculateInfoStatusType = Pick<CalculateInfoType, 'tps' | 'sl' | 'slPercent' | 'open' | 'reversed'>;

enum Status {
  OPEN = 'Open',
  SL = 'Stop loss',
  TP = 'Take profit',
  ALL_TPS = 'Last take profit',
  CANCELLED = 'Cancelled',
  SL_TP = 'Stop loss after take profit',
  REVERSED = 'Reversed'
}

export class Parser {
  private regexInitial =
    /(?<altposition>(Pair|Buy|Sell))[: \n]*?(?<pair>[\w/]+)[ ]*?[(?<position>\w)]+\nLeverage[: ]*?\w+ (?<leverage>\d+)x\nEntry(zone|[: ]*)*? (?<entry>[\d. -]+)\nTargets[: ]*?(?<tps>[\d. \w-]+)\nSL[: ]*?(?<sl>[\d.]+)/gi;
  private regexTp = /#(?<pair>[\w/]+) Take-Profit target (?<tp>\d).*\nProfit[: ]*?(?<profit>[\d.]+%)/gi;
  private regexLastTp = /#(?<pair>[\w/]+) All take-profit targets achieved.*\nProfit[: ]*?(?<profit>[\d.]+%)/gi;
  private regexSl = /#(?<pair>[\w/]+) Stoploss .*\nLoss[: ]*?(?<loss>[\d.]+%)/gi;
  private regexTpSl = /#(?<pair>[\w/]+) Closed at stoploss after reaching take profit .*/gi;
  private regexCanceled = /#(?<pair>[\w/]+) Cancelled/gi;
  private trackingPairs: TrackingPairsLogger;
  private options: ParseOptions;

  constructor(private messages: TotalList<Message>, private channelName: string, options: ParseOptions = {}) {
    this.trackingPairs = {
      last: new Map(),
      track: new Map()
    };
    this.options = { replaceDots: true, ...options };
  }

  private encodeKey({ id, pair, position }: OperationInfo) {
    return [id, pair, position].join('_');
  }

  private decodeKey(key: string): OperationInfo {
    const [id, pair, position] = key.split('_');
    return { id: +id, pair, position: this.getPosition(position) };
  }

  private getPosition(position: string) {
    const pos = position.toUpperCase().replace('BUY', 'LONG').replace('SELL', 'SHORT');
    return Position.LONG === pos ? Position.LONG : Position.SHORT;
  }

  private formatDate(date?: Date) {
    if (!date) {
      return '';
    }
    return date.toISOString().split('.')[0].replace('T', ' ');
  }

  private initInfo(info: TrackingInfo) {
    // get last for this pair
    const last = this.getLastPair(info.pair);
    if (last && last.open && last.position !== info.position) {
      const { leverage: lastLeverage, entryPrice: lastEntryPrice, position: lastPosition } = last;
      const slPercent = this.calculateInfoSl({
        entryPrice: lastEntryPrice,
        slPrice: info.entryPrice,
        leverage: lastLeverage,
        position: lastPosition
      });
      this.closeInfo(last.id, { closeDate: info.entryDate, reversed: true, sl: false, slPercent, slDate: info.entryDate, closedBy: info.id });
    }
    const { id = 0, pair = '', position } = info;
    const key: OperationInfo = { id, pair, position };
    this.trackingPairs.track.set(this.encodeKey(key), info);
    this.trackingPairs.last.set(pair, { id, pair, position });
  }

  private getLastPair(pair: string) {
    const info = this.trackingPairs.last.get(pair);
    return info && this.trackingPairs.track.get(this.encodeKey(info));
  }

  private getTrackInfo(id = 0) {
    const key = Array.from(this.trackingPairs.track.keys()).find((k) => this.decodeKey(k).id === id);
    if (!key) {
      return undefined;
    }
    const trackInfo = this.trackingPairs.track.get(key);
    return { key, trackInfo };
  }

  private updateInfo(id = 0, info: Partial<TrackingInfo>) {
    const existing = this.getTrackInfo(id);
    if (!existing || !existing.trackInfo?.open) {
      console.log('NOT FOUND REPLY (updateInfo)', id, existing);
      return;
    }
    const { key, trackInfo } = existing;
    this.trackingPairs.track.set(key, { ...trackInfo, ...info } as TrackingInfo);
  }

  private closeInfo(id = 0, info?: Partial<TrackingInfo>) {
    const existing = this.getTrackInfo(id);
    if (!existing || !existing.trackInfo?.open) {
      console.log('NOT FOUND REPLY (closeInfo)', id, existing);
      return;
    }
    const { key, trackInfo } = existing;
    this.trackingPairs.track.set(key, { ...trackInfo, ...info, open: false } as TrackingInfo);
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  private parseMessages() {
    try {
      for (let i = this.messages.length - 1; i >= 0; i--) {
        const msg = this.messages[+i];
        const { id, message, date: timeDate = 0, isReply, replyTo } = msg;
        const replyToMsgId = replyTo?.replyToMsgId || 0;
        const date = new Date(timeDate * 1000);
        if (message) {
          this.regexInitial.lastIndex = 0;
          let match = this.regexInitial.exec(message);
          if (match?.length && match.groups) {
            const { altposition, pair, position, leverage, entry, tps, sl } = match.groups;
            const tpsPrice = tps
              .split('-')
              .map((x) => Number(x.trim()))
              .filter(Boolean)
              .filter((x, pos, arr) => arr.indexOf(x) === pos);
            this.initInfo({
              id,
              entryDate: date,
              pair: pair.replace(/[/#]+/g, ''),
              position: this.getPosition(position || altposition),
              tpsPrice,
              leverage: +leverage,
              entryPrice: +entry,
              slPrice: +sl,
              tps: new Array<boolean>(tpsPrice.length).fill(false),
              tpsPercent: [],
              sl: false,
              open: true
            });
          }
          this.regexTp.lastIndex = 0;
          match = this.regexTp.exec(message);
          if (isReply && match?.length && match.groups) {
            const { tp: textTp, profit } = match.groups;
            const existing = this.getTrackInfo(replyToMsgId);
            if (!existing || !existing.trackInfo) {
              console.log('NOT FOUND REPLY (tp)', replyToMsgId, existing);
              break;
            }
            const {
              trackInfo: { tps, tpsPercent = [], tpsDate = [] }
            } = existing;
            const tp = +textTp - 1;
            tps[+tp] = true;
            tpsPercent[+tp] = parseFloat(profit);
            tpsDate[+tp] = date;
            this.updateInfo(replyToMsgId, {
              tps,
              tpsPercent,
              tpsDate
            });
          }
          this.regexLastTp.lastIndex = 0;
          match = this.regexLastTp.exec(message);
          if (isReply && match?.length && match.groups) {
            const { profit } = match.groups;
            const existing = this.getTrackInfo(replyToMsgId);
            if (!existing || !existing.trackInfo) {
              console.log('NOT FOUND REPLY (last tp)', replyToMsgId, existing);
              break;
            }
            const {
              trackInfo: { tps, tpsPercent = [], tpsDate = [] }
            } = existing;
            const tp = tps.length - 1;
            tps[+tp] = true;
            tpsPercent[+tp] = parseFloat(profit);
            tpsDate[+tp] = date;
            this.updateInfo(replyToMsgId, {
              tps,
              tpsPercent,
              tpsDate
            });
            this.closeInfo(replyToMsgId, { closeDate: date, closedBy: id });
          }
          this.regexSl.lastIndex = 0;
          match = this.regexSl.exec(message);
          if (isReply && match?.length && match.groups) {
            const { loss } = match.groups;
            this.updateInfo(replyToMsgId, {
              sl: true,
              slPercent: parseFloat(loss) * -1,
              slDate: date
            });
            this.closeInfo(replyToMsgId, { closeDate: date, closedBy: id });
          }
          this.regexTpSl.lastIndex = 0;
          match = this.regexTpSl.exec(message);
          if (isReply && match?.length && match.groups) {
            this.updateInfo(replyToMsgId, {
              sl: true,
              slDate: date
            });
            this.closeInfo(replyToMsgId, { closeDate: date, closedBy: id });
          }
          this.regexCanceled.lastIndex = 0;
          match = this.regexCanceled.exec(message);
          if (isReply && match?.length && match.groups) {
            this.closeInfo(replyToMsgId, { closeDate: date, closedBy: id });
          }
        }
      }
    } catch (e) {
      console.error('Error in parse messages', e);
    }
  }

  private calculateInfoSl({ entryPrice, slPrice, leverage, position }: CalculateInfoSlType) {
    let base = slPrice / entryPrice;
    if (position === Position.LONG) {
      base = base - 1;
    } else {
      base = 1 - base;
    }
    return Math.round(base * 100 * leverage * 10_000) / 10_000;
  }

  private calculateInfoProfits({ tps, tpsPercent = [], slPercent = 0 }: CalculateInfoProfitsType) {
    const allTps = tps.length;
    const archivedTps = tpsPercent.length;
    // const slTps = allTps - (archivedTps + 1);
    const slTps = allTps === archivedTps || !archivedTps ? 1 : allTps - archivedTps;
    const tpsSum = tpsPercent.reduce((a, x) => a + x, 0);
    return Math.round((tpsSum / allTps + slPercent / slTps) * 10_000) / 10_000;
  }

  private calculateInfoStatus({ sl, slPercent, tps, open, reversed }: CalculateInfoStatusType) {
    if (open) {
      return Status.OPEN;
    }
    const lastTp = tps.lastIndexOf(true);
    const tpNum = lastTp + 1;
    let status: string;
    if (lastTp >= 0) {
      if (sl) {
        status = `${Status.SL_TP} ${tpNum}`;
      } else if (tpNum === tps.length) {
        status = `${Status.ALL_TPS} ${tpNum}`;
      }
      status = `${Status.TP} ${tpNum}`;
    } else if (reversed) {
      status = Status.REVERSED;
    } else if (slPercent) {
      status = Status.SL;
    } else {
      status = Status.CANCELLED;
    }
    return status;
  }

  private calculateInfo({ sl, tps, tpsPercent, slPercent, open, reversed }: CalculateInfoType) {
    const status = this.calculateInfoStatus({ tps, sl, slPercent, open, reversed });
    const profit = this.calculateInfoProfits({ tps, slPercent, tpsPercent });
    return { status, profit };
  }

  generateCSV() {
    this.parseMessages();
    const header = 'ID,"Entry Date","Close Date","Duration (minutes)",Pair,Position,Status,Leverage,Profit';
    const { track } = this.trackingPairs;
    const result = Array.from(track.values())
      .map(({ id, pair, position, leverage, entryDate, closeDate, tpsPercent, slPercent, tps, sl, open, reversed }) => {
        const { profit, status } = this.calculateInfo({ tps, sl, tpsPercent, slPercent, open, reversed });
        const duration = closeDate ? Math.round(((+closeDate - +entryDate) / 1000 / 60) * 100) / 100 : '';
        let res = [id, this.formatDate(entryDate), this.formatDate(closeDate), duration, pair, position, status, leverage, profit];
        if (this.options.replaceDots) {
          res = res.map((x) => (typeof x === 'number' ? x.toString().replace('.', ',') : x));
        }
        return `"${res.join('","')}"`;
      })
      .reverse();
    const msg = [header, ...result].join('\n');
    const date = this.formatDate(new Date()).replace(/ /g, '_');
    const fileName = `${this.channelName.replace(/ /g, '_')}__${date}.csv`;
    const filePath = path.join(Config.CSV_PATH, fileName);
    mkdirp.sync(path.dirname(filePath));
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(filePath, msg);
    return filePath;
  }
}
