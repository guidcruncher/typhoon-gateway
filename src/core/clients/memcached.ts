import memjs from "memjs"

let client: any | null = null

export function getMemCachedClient(): any {
  if (!client) {
    const url = process.env.MEMCACHED_URL
    if (!url) {
      throw new Error("Memcached requested but MEMCACHED_URL is not configured")
    }

    client = memjs.Client.create(process.env.MEMCACHED_URL)
  }

  return client
}
