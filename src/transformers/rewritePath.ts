// src/transformers/rewritePath.ts

export const rewritePath = {
  name: "rewritePath",

  async onRequest(req: any, _service: any, _route: any, config: any) {
    if (!config?.replace) return

    const { from, to } = config.replace
    req.url = req.url.replace(from, to)
  },
}
