// src/transformers/scrubInternalFields.ts

export const scrubInternalFields = {
  name: "scrubInternalFields",

  async onResponse(payload: any) {
    if (payload && typeof payload === "object") {
      delete payload.internal_id
      delete payload.debug
    }
    return payload
  },
}
