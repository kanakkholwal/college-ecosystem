import Redis from "ioredis"


export const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error", err);
});

redis.on("close", () => {
  console.log("Redis closed");
})


export default redis;
