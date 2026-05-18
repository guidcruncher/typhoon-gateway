import "dotenv/config"

import { buildApp } from "./app.js"

async function start() {
  const app = await buildApp()

  const port = Number(process.env.GATEWAY_PORT || 5174)
  const host = process.env.GATEWAY_HOST || "0.0.0.0"

  await app.listen({ port, host })
  app.log.info(`Typhoon Gateway running at http://${host}:${port}`)
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
