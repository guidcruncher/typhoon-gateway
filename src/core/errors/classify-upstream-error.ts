// src/core/errors/classify-upstream-error.ts

import type { UpstreamErrorInfo } from "./types.js"

export function classifyUpstreamError(req: any, err: any): UpstreamErrorInfo {
  const code = err?.code
  const causeCode = err?.cause?.code

  //
  // ────────────────────────────────────────────────────────────
  //  TIMEOUTS
  // ────────────────────────────────────────────────────────────
  //
  // AbortController timeout (Node / undici)
  if (err?.name === "AbortError") {
    return {
      status: 504,
      code: "UPSTREAM_TIMEOUT",
      message: "Upstream request timed out",
      correlationId: req.correlationId,
    }
  }

  // Axios timeout
  if (code === "ECONNABORTED") {
    return {
      status: 504,
      code: "UPSTREAM_TIMEOUT",
      message: "Upstream request timed out",
      correlationId: req.correlationId,
    }
  }

  //
  // ────────────────────────────────────────────────────────────
  //  CONNECTION REFUSED
  // ────────────────────────────────────────────────────────────
  //
  if (code === "ECONNREFUSED" || causeCode === "ECONNREFUSED") {
    return {
      status: 502,
      code: "UPSTREAM_CONNECTION_REFUSED",
      message: "Upstream connection refused",
      correlationId: req.correlationId,
    }
  }

  //
  // ────────────────────────────────────────────────────────────
  //  DNS FAILURES
  // ────────────────────────────────────────────────────────────
  //
  if (
    code === "ENOTFOUND" ||
    causeCode === "ENOTFOUND" ||
    code === "EAI_AGAIN" || // DNS retryable failure
    causeCode === "EAI_AGAIN"
  ) {
    return {
      status: 502,
      code: "UPSTREAM_DNS_ERROR",
      message: "Upstream host not found",
      correlationId: req.correlationId,
    }
  }

  //
  // ────────────────────────────────────────────────────────────
  //  CONNECTION DROPS / SOCKET ERRORS
  // ────────────────────────────────────────────────────────────
  //
  if (
    code === "ECONNRESET" ||
    causeCode === "ECONNRESET" ||
    code === "EPIPE" ||
    causeCode === "EPIPE" ||
    code === "ETIMEDOUT" ||
    causeCode === "ETIMEDOUT"
  ) {
    return {
      status: 502,
      code: "UPSTREAM_NETWORK_ERROR",
      message: "Upstream connection dropped",
      correlationId: req.correlationId,
    }
  }

  //
  // ────────────────────────────────────────────────────────────
  //  TLS / SSL ERRORS
  // ────────────────────────────────────────────────────────────
  //
  if (
    code === "EPROTO" ||
    code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
    code === "DEPTH_ZERO_SELF_SIGNED_CERT"
  ) {
    return {
      status: 502,
      code: "UPSTREAM_TLS_ERROR",
      message: "Upstream TLS handshake failed",
      correlationId: req.correlationId,
    }
  }

  //
  // ────────────────────────────────────────────────────────────
  //  FALLBACK
  // ────────────────────────────────────────────────────────────
  //
  return {
    status: 502,
    code: "UPSTREAM_ERROR",
    message: "Upstream request failed",
    correlationId: req.correlationId,
  }
}
