import dns from "node:dns";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

// Windows 上 Node 有時讀不到系統 DNS（例如網路介面名稱含中文），會退回 127.0.0.1，
// 導致 mongodb+srv:// 的 SRV 查詢失敗（querySrv ECONNREFUSED）。這種情況才改用公用 DNS。
// MongoDB driver 用的是 dns.promises，它有自己的 resolver，要分開設定。
const isLoopbackOnly = (servers: string[]) =>
  servers.every((s) => s === "127.0.0.1" || s === "::1");
const FALLBACK_DNS = ["8.8.8.8", "1.1.1.1"];
if (isLoopbackOnly(dns.getServers())) dns.setServers(FALLBACK_DNS);
if (isLoopbackOnly(dns.promises.getServers())) dns.promises.setServers(FALLBACK_DNS);

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// 開發模式 hot reload 會重新執行模組，把連線快取在 global 上避免重複建立連線
const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache: MongooseCache = (globalForMongoose.mongooseCache ??= {
  conn: null,
  promise: null,
});

export async function connectDB() {
  if (cache.conn) return cache.conn;

  cache.promise ??= mongoose.connect(MONGODB_URI!, { bufferCommands: false });

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }

  return cache.conn;
}
