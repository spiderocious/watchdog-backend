import NodeCache from 'node-cache';
import { cacheConfig } from '@configs/cache.config';
import { logger } from './logger.util';

class CacheService {
  private static instance: CacheService;
  private cache: NodeCache;

  private constructor() {
    this.cache = new NodeCache({
      stdTTL: cacheConfig.stdTTL,
      checkperiod: cacheConfig.checkperiod,
      useClones: cacheConfig.useClones,
    });

    this.cache.on('expired', (key) => {
      logger.debug(`Cache key expired: ${key}`);
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl ?? cacheConfig.stdTTL);
  }

  delete(key: string): void {
    this.cache.del(key);
  }

  clear(): void {
    this.cache.flushAll();
  }
}

export const cacheService = CacheService.getInstance();
