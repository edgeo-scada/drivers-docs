# Metrics

The SNMP library provides built-in metrics for monitoring performance and reliability.

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
    RequestsSent      int64  // Total requests sent
    RequestsSucceeded int64  // Successful requests
    RequestsFailed    int64  // Failed requests

    // VarBind counts
    VarBindsSent      int64  // Total VarBinds in requests
    VarBindsReceived  int64  // Total VarBinds in responses
}
```

### Latency Statistics

```go
type MetricsSnapshot struct {
    // Latency
    MinLatency  time.Duration  // Minimum request latency
    MaxLatency  time.Duration  // Maximum request latency
    AvgLatency  time.Duration  // Average request latency
}
```

### Connection Statistics

```go
type MetricsSnapshot struct {
    // Connection
    ConnectionAttempts int64  // Total connection attempts
    ActiveConnections  int64  // Currently active connections
    Uptime             time.Duration  // Time since connection
}
```

## Usage Example

```go
package main

import (
    "context"
    "log"
    "time"

    "github.com/edgeo/drivers/snmp/snmp"
)

func main() {
    client := snmp.NewClient(
        snmp.WithTarget("192.168.1.1"),
        snmp.WithVersion(snmp.Version2c),
        snmp.WithCommunity("public"),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    // Perform operations
    for i := 0; i < 100; i++ {
        client.Get(ctx, snmp.OIDSysUpTime)
    }

    // Get metrics
    metrics := client.Metrics()
    snapshot := metrics.Snapshot()

    log.Printf("=== SNMP Client Metrics ===")
    log.Printf("Requests: sent=%d, success=%d, failed=%d",
        snapshot.RequestsSent, snapshot.RequestsSucceeded, snapshot.RequestsFailed)
    log.Printf("VarBinds: sent=%d, received=%d",
        snapshot.VarBindsSent, snapshot.VarBindsReceived)
    log.Printf("Latency: min=%v, avg=%v, max=%v",
        snapshot.MinLatency, snapshot.AvgLatency, snapshot.MaxLatency)
    log.Printf("Uptime: %v", snapshot.Uptime)
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
    "github.com/edgeo/drivers/snmp/snmp"
)

var (
    requestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "snmp_requests_total",
            Help: "Total SNMP requests",
        },
        []string{"status"},
    )

    latencyHistogram = prometheus.NewHistogram(
        prometheus.HistogramOpts{
            Name:    "snmp_request_duration_seconds",
            Help:    "SNMP request latency",
            Buckets: prometheus.DefBuckets,
        },
    )

    varbindsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "snmp_varbinds_total",
            Help: "Total SNMP VarBinds",
        },
        []string{"direction"},
    )
)

func init() {
    prometheus.MustRegister(requestsTotal)
    prometheus.MustRegister(latencyHistogram)
    prometheus.MustRegister(varbindsTotal)
}

func updateMetrics(client *snmp.Client) {
    snapshot := client.Metrics().Snapshot()

    requestsTotal.WithLabelValues("success").Add(float64(snapshot.RequestsSucceeded))
    requestsTotal.WithLabelValues("failed").Add(float64(snapshot.RequestsFailed))
    varbindsTotal.WithLabelValues("sent").Add(float64(snapshot.VarBindsSent))
    varbindsTotal.WithLabelValues("received").Add(float64(snapshot.VarBindsReceived))
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
func logMetrics(client *snmp.Client, interval time.Duration) {
    ticker := time.NewTicker(interval)
    defer ticker.Stop()

    for range ticker.C {
        snapshot := client.Metrics().Snapshot()
        log.Printf("[METRICS] requests=%d failed=%d avg_latency=%v",
            snapshot.RequestsSent,
            snapshot.RequestsFailed,
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
pool := snmp.NewPool(...)
stats := pool.Stats()

log.Printf("Pool: total=%d, available=%d, in_use=%d",
    stats.TotalConnections,
    stats.Available,
    stats.InUse)
```

## Metrics Summary

| Metric | Type | Description |
|--------|------|-------------|
| `RequestsSent` | Counter | Total requests sent |
| `RequestsSucceeded` | Counter | Successful requests |
| `RequestsFailed` | Counter | Failed requests |
| `VarBindsSent` | Counter | Total VarBinds sent |
| `VarBindsReceived` | Counter | Total VarBinds received |
| `MinLatency` | Gauge | Minimum request latency |
| `MaxLatency` | Gauge | Maximum request latency |
| `AvgLatency` | Gauge | Average request latency |
| `ConnectionAttempts` | Counter | Connection attempts |
| `ActiveConnections` | Gauge | Active connections |
| `Uptime` | Gauge | Time since connection |
