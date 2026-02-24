import { Injectable } from '@nestjs/common';
import NodeCache from 'node-cache';

@Injectable()
export class CacheService {
    private readonly cache: NodeCache;

    constructor() {
        this.cache = new NodeCache({
            stdTTL: 60,        // default 60 seconds
            checkperiod: 30,   // cleanup every 30s
            maxKeys: 1000,
        });
    }

    get<T>(key: string): T | undefined {
        return this.cache.get<T>(key);
    }

    set<T>(key: string, value: T, ttl?: number): void {
        if (ttl) {
            this.cache.set(key, value, ttl);
        } else {
            this.cache.set(key, value);
        }
    }

    del(key: string): void {
        this.cache.del(key);
    }

    flush(): void {
        this.cache.flushAll();
    }

    stats() {
        return this.cache.getStats();
    }
}
