import { Rate } from '../exchange-rate/exchange-rate.service';

export class Cache {
  public map: Rate;
  public ttl: number;
  public size: number;

  constructor() {
    this.map = {};
    this.ttl = 1000;
    this.size = 0;
  }

  get(key: string) {
    if (this.map[key]) {
      return this.map[key];
    }
  }

  set(key: string, value: any) {
    if (this.map[key]) {
      this.remove(key);
    }

    this.map[key] = value;
    this.size++;
  }

  remove(key: string) {
    if (this.map[key]) {
      delete this.map[key];
      this.size--;
    }
  }

  has(key: string) {
    return !!this.map[key];
  }

  clear() {
    this.map = {};
    this.size = 0;
  }
}
