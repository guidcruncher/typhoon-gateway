import type { UpstreamErrorInfo } from "./types.js"

export function classifyUpstreamError(err: any): UpstreamErrorInfo {
  // Timeout (AbortSignal.timeout)
  if (err?.name === "AbortError") {
    return {
      status: 504,
      code: "UPSTREAM_TIMEOUT",
      message: "Upstream request timed out",
    }
  }

  // Connection refused
  if (err?.cause?.code === "ECONNREFUSED") {
    return {
      status: 502,
      code: "UPSTREAM_CONNECTION_REFUSED",
      message: "Upstream connection refused",
    }
  }

  // DNS resolution failure
  if (err?.cause?.code === "ENOTFOUND") {
    return {
      status: 502,
      code: "UPSTREAM_DNS_ERROR",
      message: "Upstream host not found",
    }
  }

  // Generic network or fetch error
  return {
    status: 502,
    code: "UPSTREAM_ERROR",
    message: "Upstream request failed",
  }
}
