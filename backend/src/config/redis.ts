import IORedis from "ioredis";
import { env } from "./env";

const useTLS = env.REDIS_URL.startsWith("rediss://");
const commonOpts = {
  maxRetriesPerRequest: null,
  ...(useTLS ? { tls: {} } : {}),
};

export const redis = new IORedis(env.REDIS_URL, commonOpts) as any;
export const cacheRedis = new IORedis(env.REDIS_URL, commonOpts);
export const redisPub = new IORedis(env.REDIS_URL, commonOpts);
export const redisSub = new IORedis(env.REDIS_URL, commonOpts);
