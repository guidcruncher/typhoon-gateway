// src/transformers/addResponseEnvelope.ts

export const addResponseEnvelope = {
  name: "addResponseEnvelope",

  async onResponse(payload: any) {
    return {
      ok: true,
      timestamp: Date.now(),
      data: payload,
    }
  },
}
