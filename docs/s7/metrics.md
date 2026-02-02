# Metrics

The S7 library provides built-in metrics for monitoring performance and reliability.

## Accessing Metrics

```go
metrics := client.Metrics()
snapshot := metrics.Snapshot()
```

## Available Metrics

### Request Counters

```go
type MetricsSnapshot struct {
    // Request counts
    RequestCount  int64  // Total requests sent
    SuccessCount  int64  // Successful requests
    ErrorCount    int64  // Failed requests

    // Bytes transferred
    BytesRead     int64  // Total bytes read
    BytesWritten  int64  // Total bytes written
}
```

### Latency Statistics

```go
type MetricsSnapshot struct {
    // Latency
    MinLatency    time.Duration  // Minimum request latency
    MaxLatency    time.Duration  // Maximum request latency
    AvgLatency    time.Duration  // Average request latency

    // Percentiles
    P50Latency    time.Duration  // 50th percentile (median)
    P95Latency    time.Duration  // 95th percentile
    P99Latency    time.Duration  // 99th percentile
}
```

### Connection Statistics

```go
type MetricsSnapshot struct {
    // Connection
    ConnectionAttempts  int64  // Total connection attempts
    ReconnectCount      int64  // Number of reconnections
    CurrentState        string // Current connection state
    Uptime              time.Duration // Time since last connection
}
```

## Usage Example

```go
package main

import (
    "context"
    "log"
    "time"

    "github.com/edgeo/drivers/s7/s7"
)

func main() {
    client := s7.NewClient("192.168.1.10", s7.WithRack(0), s7.WithSlot(1))

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    // Perform operations
    for i := 0; i < 100; i++ {
        _, _ = client.ReadDB(ctx, 1, 0, 10)
    }

    // Get metrics
    metrics := client.Metrics()
    snapshot := metrics.Snapshot()

    log.Printf("=== S7 Client Metrics ===")
    log.Printf("Requests: %d (success: %d, errors: %d)",
        snapshot.RequestCount, snapshot.SuccessCount, snapshot.ErrorCount)
    log.Printf("Bytes: read=%d, written=%d",
        snapshot.BytesRead, snapshot.BytesWritten)
    log.Printf("Latency: min=%v, avg=%v, max=%v",
        snapshot.MinLatency, snapshot.AvgLatency, snapshot.MaxLatency)
    log.Printf("Percentiles: p50=%v, p95=%v, p99=%v",
        snapshot.P50Latency, snapshot.P95Latency, snapshot.P99Latency)
}
```

## Prometheus Integration

Export metrics to Prometheus:

```go
package main

import (
    "net/http"

    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
    "github.com/edgeo/drivers/s7/s7"
)

var (
    requestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "s7_requests_total",
            Help: "Total S7 requests",
        },
        []string{"status"},
    )

    latencyHistogram = prometheus.NewHistogram(
        prometheus.HistogramOpts{
            Name:    "s7_request_duration_seconds",
            Help:    "S7 request latency",
            Buckets: prometheus.DefBuckets,
        },
    )
)

func init() {
    prometheus.MustRegister(requestsTotal)
    prometheus.MustRegister(latencyHistogram)
}

func updateMetrics(client *s7.Client) {
    snapshot := client.Metrics().Snapshot()

    requestsTotal.WithLabelValues("success").Add(float64(snapshot.SuccessCount))
    requestsTotal.WithLabelValues("error").Add(float64(snapshot.ErrorCount))
    latencyHistogram.Observe(snapshot.AvgLatency.Seconds())
}

func main() {
    // ... client setup ...

    http.Handle("/metrics", promhttp.Handler())
    http.ListenAndServe(":9090", nil)
}
```

## Periodic Metrics Logging

```go
func logMetrics(client *s7.Client, interval time.Duration) {
    ticker := time.NewTicker(interval)
    defer ticker.Stop()

    for range ticker.C {
        snapshot := client.Metrics().Snapshot()
        log.Printf("[METRICS] requests=%d errors=%d avg_latency=%v",
            snapshot.RequestCount,
            snapshot.ErrorCount,
            snapshot.AvgLatency)
    }
}

// Usage
go logMetrics(client, 30*time.Second)
```

## Reset Metrics

```go
// Reset all metrics to zero
client.Metrics().Reset()
```

## Pool Metrics

When using connection pooling:

```go
pool := s7.NewPool("192.168.1.10", s7.WithPoolSize(5))
stats := pool.Stats()

log.Printf("Pool: total=%d, available=%d, in_use=%d",
    stats.TotalConnections,
    stats.Available,
    stats.InUse)
```

## Metrics Summary

| Metric | Type | Description |
|--------|------|-------------|
| `RequestCount` | Counter | Total requests sent |
| `SuccessCount` | Counter | Successful requests |
| `ErrorCount` | Counter | Failed requests |
| `BytesRead` | Counter | Total bytes read from PLC |
| `BytesWritten` | Counter | Total bytes written to PLC |
| `MinLatency` | Gauge | Minimum request latency |
| `MaxLatency` | Gauge | Maximum request latency |
| `AvgLatency` | Gauge | Average request latency |
| `P50Latency` | Gauge | 50th percentile latency |
| `P95Latency` | Gauge | 95th percentile latency |
| `P99Latency` | Gauge | 99th percentile latency |
| `ReconnectCount` | Counter | Number of reconnections |
