import { addResponseEnvelope } from "./addResponseEnvelope.js"
import { checkAdmin } from "./checkAdmin.js"
import { compressResponse } from "./compressResponse.js"
import { injectRequestId } from "./injectRequestId.js"
import { maskFields } from "./maskFields.js"
import { rewritePath } from "./rewritePath.js"
import { scrubInternalFields } from "./scrubInternalFields.js"
import { validateQuery } from "./validateQuery.js"

// Registry of transformer implementations
export const registry: Record<string, any> = {
  injectRequestId,
  checkAdmin,
  scrubInternalFields,
  validateQuery,
  addResponseEnvelope,
  rewritePath,
  maskFields,
  compressResponse,
}
