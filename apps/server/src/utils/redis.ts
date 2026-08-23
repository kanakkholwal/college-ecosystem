import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const redisClient = new Redis(process.env.REDIS_URL);
