import axios from "axios"
import fp from "fastify-plugin"

export default fp(async function httpClientPlugin(fastify) {
  const client = axios.create({
    timeout: 30_000,
    validateStatus: () => true,
  })

  fastify.decorate("httpClient", {
    request: async (config) => {
      try {
        return await client.request({
          method: config.method,
          url: config.url,
          headers: config.headers,
          data: config.body,
          timeout: config.timeout,
        })
      } catch (err) {
        // Preserve Axios error shape for classifier
        fastify.log.error(err, `Error accessing upstream ${config.method} ${config.url}`)
        throw err
      }
    },
  })
})
