import Redis from "ioredis"

let client: Redis.Redis | null = null

export function getRedisClient(): Redis.Redis {
  if (!client) {
    const url = process.env.REDIS_URL
    if (!url) {
      throw new Error("Redis requested but REDIS_URL is not configured")
    }

    client = new Redis.Redis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    })
  }

  return client
}
