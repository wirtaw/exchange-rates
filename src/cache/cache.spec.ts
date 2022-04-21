import { Cache } from './cache';
import { Rate } from '../exchange-rate/exchange-rate.service';

describe('Cache', () => {
  let cache: Cache;
  const rates: Map<string, Rate> = new Map();
  const loadRates = (): void => {
    rates.set('EUR', { USD: 4.5, GBP: 1.1, ILS: 1.6 });
    rates.set('USD', { EUR: 4.5, GBP: 1.2, ILS: 1.7 });
    rates.set('GBP', { USD: 4.5, EUR: 1.3, ILS: 1.8 });
    rates.set('ILS', { USD: 4.5, GBP: 1.4, EUR: 1.9 });
  };

  beforeEach(async () => {
    cache = new Cache();
    rates.clear();
    loadRates();
  });

  it('should be defined', () => {
    expect(cache).toBeDefined();
  });

  describe('add items', () => {
    it('should store and get rate GBP:EUR', () => {
      rates.forEach((value, key) => {
        for (const currency of Object.keys(value)) {
          cache.set(`${key}:${currency}`, value[currency]);
        }
      });
      expect(cache.get('GBP:EUR')).toEqual(1.3);
      expect(cache.size).toEqual(12);
    });
  });

  describe('remove items', () => {
    it('should store and remove rate GBP:EUR', () => {
      rates.forEach((value, key) => {
        for (const currency of Object.keys(value)) {
          cache.set(`${key}:${currency}`, value[currency]);
        }
      });
      expect(cache.get('GBP:EUR')).toEqual(1.3);
      cache.remove('GBP:EUR');
      expect(cache.get('GBP:EUR')).toEqual(undefined);
    });
  });

  describe('clear items', () => {
    it('should store and clear all', () => {
      rates.forEach((value, key) => {
        for (const currency of Object.keys(value)) {
          cache.set(`${key}:${currency}`, value[currency]);
        }
      });
      expect(cache.get('ILS:EUR')).toEqual(1.9);
      cache.clear();
      expect(cache.get('ILS:EUR')).toEqual(undefined);
      expect(cache.size).toEqual(0);
    });
  });

  describe('update item', () => {
    it('should store and update one pair', () => {
      rates.forEach((value, key) => {
        for (const currency of Object.keys(value)) {
          cache.set(`${key}:${currency}`, value[currency]);
        }
      });
      expect(cache.get('ILS:EUR')).toEqual(1.9);
      cache.set('ILS:EUR', 10.5);
      expect(cache.get('ILS:EUR')).toEqual(10.5);
      expect(cache.size).toEqual(12);
    });
  });

  describe('has item', () => {
    it('should store and update one pair', () => {
      rates.forEach((value, key) => {
        for (const currency of Object.keys(value)) {
          cache.set(`${key}:${currency}`, value[currency]);
        }
      });
      expect(cache.has('USD:GBP')).toEqual(true);
      expect(cache.has('PLN:LTL')).toEqual(false);
    });
  });
});
