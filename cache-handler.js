/**
 * cache-handler.js — Minimal Next.js cache handler (pass-through)
 * Required by next.config.js: cacheHandler in production.
 * Using a no-op keeps Next.js default in-memory behaviour while
 * satisfying the require.resolve() call without throwing.
 */
module.exports = class CacheHandler {
  constructor(_options) {}

  async get(_key) {
    return null;
  }

  async set(_key, _data, _ctx) {}

  async revalidateTag(_tag) {}
};

