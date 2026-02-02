# Metrics

The BACnet library provides built-in metrics for monitoring performance and reliability.

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

    // Discovery
    DevicesDiscovered int64  // Devices found via WhoIs
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
    Uptime time.Duration  // Time since connection
}
```

## Usage Example

```go
package main

import (
    "context"
    "log"
    "time"

    "github.com/edgeo/drivers/bacnet/bacnet"
)

func main() {
    client := bacnet.NewClient(
        bacnet.WithTimeout(3*time.Second),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    // Perform operations
    client.WhoIs(ctx)

    for i := 0; i < 100; i++ {
        client.ReadProperty(ctx, 1234, bacnet.ObjectAnalogInput(0), bacnet.PropertyPresentValue)
    }

    // Get metrics
    metrics := client.Metrics()
    snapshot := metrics.Snapshot()

    log.Printf("=== BACnet Client Metrics ===")
    log.Printf("Requests: sent=%d, success=%d, failed=%d",
        snapshot.RequestsSent, snapshot.RequestsSucceeded, snapshot.RequestsFailed)
    log.Printf("Devices discovered: %d", snapshot.DevicesDiscovered)
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
    "github.com/edgeo/drivers/bacnet/bacnet"
)

var (
    requestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "bacnet_requests_total",
            Help: "Total BACnet requests",
        },
        []string{"status"},
    )

    devicesDiscovered = prometheus.NewGauge(
        prometheus.GaugeOpts{
            Name: "bacnet_devices_discovered",
            Help: "Number of BACnet devices discovered",
        },
    )

    latencyHistogram = prometheus.NewHistogram(
        prometheus.HistogramOpts{
            Name:    "bacnet_request_duration_seconds",
            Help:    "BACnet request latency",
            Buckets: prometheus.DefBuckets,
        },
    )
)

func init() {
    prometheus.MustRegister(requestsTotal)
    prometheus.MustRegister(devicesDiscovered)
    prometheus.MustRegister(latencyHistogram)
}

func updateMetrics(client *bacnet.Client) {
    snapshot := client.Metrics().Snapshot()

    requestsTotal.WithLabelValues("success").Add(float64(snapshot.RequestsSucceeded))
    requestsTotal.WithLabelValues("failed").Add(float64(snapshot.RequestsFailed))
    devicesDiscovered.Set(float64(snapshot.DevicesDiscovered))
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
func logMetrics(client *bacnet.Client, interval time.Duration) {
    ticker := time.NewTicker(interval)
    defer ticker.Stop()

    for range ticker.C {
        snapshot := client.Metrics().Snapshot()
        log.Printf("[METRICS] requests=%d failed=%d devices=%d avg_latency=%v",
            snapshot.RequestsSent,
            snapshot.RequestsFailed,
            snapshot.DevicesDiscovered,
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

## Metrics Summary

| Metric | Type | Description |
|--------|------|-------------|
| `RequestsSent` | Counter | Total requests sent |
| `RequestsSucceeded` | Counter | Successful requests |
| `RequestsFailed` | Counter | Failed requests |
| `DevicesDiscovered` | Counter | Devices found via WhoIs |
| `MinLatency` | Gauge | Minimum request latency |
| `MaxLatency` | Gauge | Maximum request latency |
| `AvgLatency` | Gauge | Average request latency |
| `Uptime` | Gauge | Time since connection |
