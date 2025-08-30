// lib/rate-limiter.ts
interface RateLimitEntry {
    count: number;
    resetTime: number;
  }
  
  class RateLimiter {
    private store = new Map<string, RateLimitEntry>();
    private cleanupInterval: NodeJS.Timeout;
  
    constructor() {
      // Clean up expired entries every 5 minutes
      this.cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
          if (now > entry.resetTime) {
            this.store.delete(key);
          }
        }
      }, 5 * 60 * 1000);
    }
  
    // Check if request is allowed
    public isAllowed(identifier: string, limit: number, windowMs: number): boolean {
      const now = Date.now();
      const entry = this.store.get(identifier);
  
      if (!entry || now > entry.resetTime) {
        // First request or window expired
        this.store.set(identifier, {
          count: 1,
          resetTime: now + windowMs
        });
        return true;
      }
  
      if (entry.count >= limit) {
        return false;
      }
  
      entry.count += 1;
      return true;
    }
  
    // Get remaining requests and time until reset
    public getStatus(identifier: string): { remaining: number; resetTime: number } {
      const entry = this.store.get(identifier);
      if (!entry) {
        return { remaining: 0, resetTime: 0 };
      }
  
      return {
        remaining: Math.max(0, entry.resetTime - Date.now()),
        resetTime: entry.resetTime
      };
    }
  
    public cleanup(): void {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }
    }
  }
  
  // Singleton instance
  export const rateLimiter = new RateLimiter();
  
  // Rate limiting constants
  export const RATE_LIMITS = {
    SPIN_ATTEMPTS: {
      limit: 5, // 5 attempts
      windowMs: 60 * 1000, // per minute
    },
    GENERAL_API: {
      limit: 100, // 100 requests
      windowMs: 60 * 1000, // per minute
    }
  } as const;