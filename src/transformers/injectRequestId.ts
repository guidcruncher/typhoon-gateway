// src/transformers/injectRequestId.ts

import { randomUUID } from "node:crypto"

export const injectRequestId = {
  name: "injectRequestId",

  async onRequest(req: any, _service: any, _route: any, config: any) {
    const headerName = config?.header ?? "x-request-id"
    req.headers[headerName] = randomUUID()
  },
}
