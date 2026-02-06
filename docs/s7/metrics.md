# Metrics and Observability

The package includes built-in metrics for monitoring.

## Client Metrics

### Structure

```go
type Metrics struct {
    // Connection
    ActiveConns   Counter  // Active connections (0 or 1)
    Reconnections Counter  // Number of reconnections

    // Requests
    RequestsTotal   Counter  // Total requests sent
    RequestsSuccess Counter  // Successful requests
    RequestsErrors  Counter  // Failed requests

    // Data
    BytesRead    Counter  // Bytes read
    BytesWritten Counter  // Bytes written

    // Latency
    Latency *LatencyHistogram
}
```

### Accessing Metrics

```go
client, _ := s7.NewClient("192.168.1.100:102")

// After some operations...
snapshot := client.Metrics().Snapshot()

fmt.Printf("Total requests: %d\n", snapshot.RequestsTotal)
fmt.Printf("Successful requests: %d\n", snapshot.RequestsSuccess)
fmt.Printf("Errors: %d\n", snapshot.RequestsErrors)
fmt.Printf("Reconnections: %d\n", snapshot.Reconnections)
fmt.Printf("Active connections: %d\n", snapshot.ActiveConns)
fmt.Printf("Bytes read: %d\n", snapshot.BytesRead)
fmt.Printf("Bytes written: %d\n", snapshot.BytesWritten)
```

### Latency

```go
snapshot := client.Metrics().Snapshot()
latency := snapshot.Latency

fmt.Printf("Average latency: %v\n", latency.Avg)
fmt.Printf("Min latency: %v\n", latency.Min)
fmt.Printf("Max latency: %v\n", latency.Max)
fmt.Printf("P50 latency: %v\n", latency.P50)
fmt.Printf("P95 latency: %v\n", latency.P95)
fmt.Printf("P99 latency: %v\n", latency.P99)
fmt.Printf("Number of measurements: %d\n", latency.Count)
```

## Latency Statistics

### Structure

```go
type LatencyStats struct {
    Count int64         // Number of measurements
    Min   time.Duration // Minimum
    Max   time.Duration // Maximum
    Avg   time.Duration // Average
    P50   time.Duration // 50th percentile (median)
    P95   time.Duration // 95th percentile
    P99   time.Duration // 99th percentile
}
```

Percentiles are calculated over the last 1000 measurements.

## Counter

The `Counter` type is thread-safe:

```go
type Counter struct {
    value int64
}

func (c *Counter) Add(delta int64)  // Add (or subtract if negative)
func (c *Counter) Value() int64     // Read the value
```

## LatencyHistogram

```go
type LatencyHistogram struct {
    // ...
}

func (h *LatencyHistogram) Observe(d time.Duration)  // Record a measurement
func (h *LatencyHistogram) Stats() LatencyStats      // Get statistics
```

## Prometheus Integration

Example of exposing metrics for Prometheus:

```go
package main

import (
    "net/http"

    "github.com/edgeo-scada/drivers/s7"
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

type S7Collector struct {
    client *s7.Client

    requestsTotal   *prometheus.Desc
    requestsSuccess *prometheus.Desc
    requestsErrors  *prometheus.Desc
    latencyAvg      *prometheus.Desc
    latencyP95      *prometheus.Desc
    reconnections   *prometheus.Desc
}

func NewS7Collector(client *s7.Client) *S7Collector {
    return &S7Collector{
        client: client,
        requestsTotal: prometheus.NewDesc(
            "s7_requests_total",
            "Total number of S7 requests",
            nil, nil,
        ),
        requestsSuccess: prometheus.NewDesc(
            "s7_requests_success_total",
            "Number of successful S7 requests",
            nil, nil,
        ),
        requestsErrors: prometheus.NewDesc(
            "s7_requests_errors_total",
            "Number of failed S7 requests",
            nil, nil,
        ),
        latencyAvg: prometheus.NewDesc(
            "s7_latency_avg_seconds",
            "Average request latency in seconds",
            nil, nil,
        ),
        latencyP95: prometheus.NewDesc(
            "s7_latency_p95_seconds",
            "95th percentile request latency in seconds",
            nil, nil,
        ),
        reconnections: prometheus.NewDesc(
            "s7_reconnections_total",
            "Total number of reconnections",
            nil, nil,
        ),
    }
}

func (c *S7Collector) Describe(ch chan<- *prometheus.Desc) {
    ch <- c.requestsTotal
    ch <- c.requestsSuccess
    ch <- c.requestsErrors
    ch <- c.latencyAvg
    ch <- c.latencyP95
    ch <- c.reconnections
}

func (c *S7Collector) Collect(ch chan<- prometheus.Metric) {
    snapshot := c.client.Metrics().Snapshot()

    ch <- prometheus.MustNewConstMetric(
        c.requestsTotal,
        prometheus.CounterValue,
        float64(snapshot.RequestsTotal),
    )
    ch <- prometheus.MustNewConstMetric(
        c.requestsSuccess,
        prometheus.CounterValue,
        float64(snapshot.RequestsSuccess),
    )
    ch <- prometheus.MustNewConstMetric(
        c.requestsErrors,
        prometheus.CounterValue,
        float64(snapshot.RequestsErrors),
    )
    ch <- prometheus.MustNewConstMetric(
        c.latencyAvg,
        prometheus.GaugeValue,
        snapshot.Latency.Avg.Seconds(),
    )
    ch <- prometheus.MustNewConstMetric(
        c.latencyP95,
        prometheus.GaugeValue,
        snapshot.Latency.P95.Seconds(),
    )
    ch <- prometheus.MustNewConstMetric(
        c.reconnections,
        prometheus.CounterValue,
        float64(snapshot.Reconnections),
    )
}

func main() {
    client, _ := s7.NewClient("192.168.1.100:102")

    collector := NewS7Collector(client)
    prometheus.MustRegister(collector)

    http.Handle("/metrics", promhttp.Handler())
    http.ListenAndServe(":9090", nil)
}
```

## expvar Integration

```go
import (
    "encoding/json"
    "expvar"
)

func init() {
    expvar.Publish("s7", expvar.Func(func() interface{} {
        return client.Metrics().Snapshot()
    }))
}
```

Accessible via `http://localhost:8080/debug/vars`.

## Monitoring Example

```go
package main

import (
    "context"
    "fmt"
    "time"

    "github.com/edgeo-scada/drivers/s7"
)

func main() {
    client, _ := s7.NewClient("192.168.1.100:102",
        s7.WithRack(0),
        s7.WithSlot(1),
    )
    defer client.Close()

    ctx := context.Background()
    client.Connect(ctx)

    // Perform operations
    for i := 0; i < 100; i++ {
        client.ReadDB(ctx, 1, 0, 10)
    }

    // Display metrics
    snapshot := client.Metrics().Snapshot()

    fmt.Println("=== S7 Metrics ===")
    fmt.Printf("Total requests:      %d\n", snapshot.RequestsTotal)
    fmt.Printf("Successful requests: %d\n", snapshot.RequestsSuccess)
    fmt.Printf("Failed requests:     %d\n", snapshot.RequestsErrors)
    fmt.Printf("Reconnections:       %d\n", snapshot.Reconnections)
    fmt.Println()
    fmt.Println("=== Latency ===")
    fmt.Printf("Average: %v\n", snapshot.Latency.Avg)
    fmt.Printf("Min:     %v\n", snapshot.Latency.Min)
    fmt.Printf("Max:     %v\n", snapshot.Latency.Max)
    fmt.Printf("P50:     %v\n", snapshot.Latency.P50)
    fmt.Printf("P95:     %v\n", snapshot.Latency.P95)
    fmt.Printf("P99:     %v\n", snapshot.Latency.P99)

    // Calculate success rate
    if snapshot.RequestsTotal > 0 {
        successRate := float64(snapshot.RequestsSuccess) / float64(snapshot.RequestsTotal) * 100
        fmt.Printf("\nSuccess rate: %.1f%%\n", successRate)
    }
}
```
