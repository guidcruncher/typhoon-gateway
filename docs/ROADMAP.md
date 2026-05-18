# Typhoon Roadmap v2 (Updated With OpenAPI)

Phase 1 — Stability & Observability (High Priority)
These items harden the gateway and improve visibility.

1. Streaming lifecycle manager  
   Ensures safe streaming, prevents double-send, fixes edge cases with compression/collapsing.

2. Upstream retry policy  
   Exponential backoff + jitter for network failures.

3. OpenTelemetry exporter  
   Export spans to Jaeger/Tempo; add upstream timing, cache hits, breaker state.

4. Structured logging  
   Correlation ID in every log; upstream latency, cache status, breaker state.

---

Phase 2 — Distributed Features (Medium Priority)
Cluster‑level behaviour for multi-node Typhoon deployments.

1. Distributed request collapsing  
   Redis/NATS-based dedupe to prevent stampedes across nodes.

2. Distributed circuit breaker  
   Shared breaker state across cluster nodes.

3. Advanced caching  
   Redis cache, stale-while-revalidate, cache tags.

---

Phase 3 — Developer Experience & API Governance (Medium Priority)
This is where OpenAPI becomes a major feature.

1. OpenAPI → Manifest generation  
   Import OpenAPI specs and generate Typhoon manifest entries automatically.

2. OpenAPI-based request/response validation  
   Validate bodies, params, headers using schemas extracted from OpenAPI.

3. OpenAPI documentation endpoint  
   /docs endpoint using Scalar, Swagger UI, or Redoc.

4. Transformer sandboxing  
   Safe JS transforms with CPU/memory limits.

5. Request body transformers  
   Modify JSON bodies, rewrite payloads, inject headers.

6. Manifest v3  
   Service groups, canary routing, weighted upstreams.

---

Phase 4 — CDN‑Grade Features (Low Priority)
High-performance edge features.

1. Edge caching rules  
   Cache by header, cookie, query param.

2. Response rewriting  
   HTML rewriting, link rewriting, cookie rewriting.

3. API key quota buckets  
   Per-key quotas, burst control.

