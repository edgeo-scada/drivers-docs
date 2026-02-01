---
sidebar_position: 8
---

# Metrics

The OPC UA package provides built-in metrics for monitoring and observability.

## Available Metrics

### Client

| Metric | Type | Description |
|--------|------|-------------|
| `requests_total` | Counter | Total number of requests |
| `requests_success` | Counter | Number of successful requests |
| `requests_errors` | Counter | Number of failed requests |
| `reconnections` | Counter | Number of reconnections |
| `active_connections` | Gauge | Active connections |
| `active_sessions` | Gauge | Active sessions |
| `active_subscriptions` | Gauge | Active subscriptions |
| `monitored_items` | Gauge | Monitored items |
| `latency` | Histogram | Request latency |

### Server

| Metric | Type | Description |
|--------|------|-------------|
| `connections_total` | Counter | Total connections received |
| `active_connections` | Gauge | Active connections |
| `active_sessions` | Gauge | Active sessions |
| `active_subscriptions` | Gauge | Active subscriptions |
| `monitored_items` | Gauge | Monitored items |
| `requests_total` | Counter | Total requests processed |
| `requests_by_service` | Counter | Requests by service type |
| `publish_notifications` | Counter | Published notifications |
| `bytes_received` | Counter | Bytes received |
| `bytes_sent` | Counter | Bytes sent |

### Pool

| Metric | Type | Description |
|--------|------|-------------|
| `pool_size` | Gauge | Configured pool size |
| `active_connections` | Gauge | Connections in use |
| `idle_connections` | Gauge | Waiting connections |
| `total_connections` | Gauge | Total connections |
| `wait_count` | Gauge | Requests waiting for a connection |
| `avg_wait_time` | Gauge | Average wait time |

## Collecting Metrics

### Client

```go
client, _ := opcua.NewClient("localhost:4840")

// Get metrics
metrics := client.Metrics()

// Collect all metrics
all := metrics.Collect()
fmt.Printf("Total requests: %v\n", all["requests_total"])
fmt.Printf("Successful requests: %v\n", all["requests_success"])
fmt.Printf("Failed requests: %v\n", all["requests_errors"])
fmt.Printf("Reconnections: %v\n", all["reconnections"])
fmt.Printf("Latency P50: %v\n", all["latency_p50"])
fmt.Printf("Latency P99: %v\n", all["latency_p99"])
```

### Server

```go
server, _ := opcua.NewServer(...)

stats := server.Metrics()
fmt.Printf("Active sessions: %d\n", stats.ActiveSessions)
fmt.Printf("Subscriptions: %d\n", stats.ActiveSubscriptions)
fmt.Printf("Requests processed: %d\n", stats.RequestsTotal)
```

### Pool

```go
pool, _ := opcua.NewPool("localhost:4840", ...)

stats := pool.Stats()
fmt.Printf("Active connections: %d\n", stats.ActiveConnections)
fmt.Printf("Idle connections: %d\n", stats.IdleConnections)
fmt.Printf("Average wait time: %v\n", stats.AvgWaitTime)
```

## Prometheus Integration

### Exposing Metrics

```go
import (
    "net/http"
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

// Create Prometheus metrics
var (
    opcuaRequestsTotal = prometheus.NewCounter(prometheus.CounterOpts{
        Name: "opcua_requests_total",
        Help: "Total number of OPC UA requests",
    })
    opcuaRequestsErrors = prometheus.NewCounter(prometheus.CounterOpts{
        Name: "opcua_requests_errors",
        Help: "Total number of OPC UA request errors",
    })
    opcuaLatency = prometheus.NewHistogram(prometheus.HistogramOpts{
        Name:    "opcua_request_duration_seconds",
        Help:    "OPC UA request duration in seconds",
        Buckets: prometheus.DefBuckets,
    })
)

func init() {
    prometheus.MustRegister(opcuaRequestsTotal)
    prometheus.MustRegister(opcuaRequestsErrors)
    prometheus.MustRegister(opcuaLatency)
}

// Collect periodically
func collectMetrics(client *opcua.Client) {
    ticker := time.NewTicker(10 * time.Second)
    defer ticker.Stop()

    var lastTotal, lastErrors uint64

    for range ticker.C {
        m := client.Metrics().Collect()

        currentTotal := m["requests_total"].(uint64)
        currentErrors := m["requests_errors"].(uint64)

        opcuaRequestsTotal.Add(float64(currentTotal - lastTotal))
        opcuaRequestsErrors.Add(float64(currentErrors - lastErrors))

        lastTotal = currentTotal
        lastErrors = currentErrors
    }
}

func main() {
    // Expose metrics
    http.Handle("/metrics", promhttp.Handler())
    go http.ListenAndServe(":9090", nil)

    // ...
}
```

### Custom Collector

```go
type OPCUACollector struct {
    client *opcua.Client
    requestsDesc *prometheus.Desc
    errorsDesc   *prometheus.Desc
}

func NewOPCUACollector(client *opcua.Client) *OPCUACollector {
    return &OPCUACollector{
        client: client,
        requestsDesc: prometheus.NewDesc(
            "opcua_requests_total",
            "Total OPC UA requests",
            nil, nil,
        ),
        errorsDesc: prometheus.NewDesc(
            "opcua_errors_total",
            "Total OPC UA errors",
            nil, nil,
        ),
    }
}

func (c *OPCUACollector) Describe(ch chan<- *prometheus.Desc) {
    ch <- c.requestsDesc
    ch <- c.errorsDesc
}

func (c *OPCUACollector) Collect(ch chan<- prometheus.Metric) {
    m := c.client.Metrics().Collect()

    ch <- prometheus.MustNewConstMetric(
        c.requestsDesc,
        prometheus.CounterValue,
        float64(m["requests_total"].(uint64)),
    )
    ch <- prometheus.MustNewConstMetric(
        c.errorsDesc,
        prometheus.CounterValue,
        float64(m["requests_errors"].(uint64)),
    )
}
```

## OpenTelemetry Integration

```go
import (
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/metric"
)

var meter = otel.Meter("opcua")

func setupMetrics(client *opcua.Client) {
    requestsCounter, _ := meter.Int64Counter(
        "opcua.requests",
        metric.WithDescription("Total OPC UA requests"),
    )

    errorsCounter, _ := meter.Int64Counter(
        "opcua.errors",
        metric.WithDescription("Total OPC UA errors"),
    )

    latencyHistogram, _ := meter.Float64Histogram(
        "opcua.latency",
        metric.WithDescription("OPC UA request latency"),
        metric.WithUnit("ms"),
    )

    // Observer callback
    _, _ = meter.RegisterCallback(func(_ context.Context, o metric.Observer) error {
        m := client.Metrics().Collect()
        // Observe values...
        return nil
    })
}
```

## Latency Histogram

```go
metrics := client.Metrics()

// Access percentiles
latency := metrics.Latency

fmt.Printf("Min: %v\n", latency.Min())
fmt.Printf("Max: %v\n", latency.Max())
fmt.Printf("Mean: %v\n", latency.Mean())
fmt.Printf("P50: %v\n", latency.Percentile(50))
fmt.Printf("P90: %v\n", latency.Percentile(90))
fmt.Printf("P95: %v\n", latency.Percentile(95))
fmt.Printf("P99: %v\n", latency.Percentile(99))
```

## Metrics-based Alerts

```go
func monitorHealth(client *opcua.Client) {
    ticker := time.NewTicker(30 * time.Second)
    defer ticker.Stop()

    for range ticker.C {
        m := client.Metrics().Collect()

        // Alert if too many errors
        errorRate := float64(m["requests_errors"].(uint64)) /
                     float64(m["requests_total"].(uint64))
        if errorRate > 0.05 {
            alerting.Send("OPC UA error rate high", errorRate)
        }

        // Alert if latency high
        p99 := m["latency_p99"].(time.Duration)
        if p99 > 5*time.Second {
            alerting.Send("OPC UA latency high", p99)
        }

        // Alert if not connected
        if !client.IsConnected() {
            alerting.Send("OPC UA disconnected", nil)
        }
    }
}
```

## Complete Example

```go
package main

import (
    "context"
    "fmt"
    "log"
    "net/http"
    "time"

    "github.com/edgeo/drivers/opcua"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
    // Create the client
    client, err := opcua.NewClient("localhost:4840",
        opcua.WithEndpoint("opc.tcp://localhost:4840"),
    )
    if err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    ctx := context.Background()
    if err := client.ConnectAndActivateSession(ctx); err != nil {
        log.Fatal(err)
    }

    // Expose Prometheus metrics
    http.Handle("/metrics", promhttp.Handler())
    go http.ListenAndServe(":9090", nil)

    // Display metrics periodically
    ticker := time.NewTicker(10 * time.Second)
    defer ticker.Stop()

    for range ticker.C {
        m := client.Metrics().Collect()

        fmt.Println("=== OPC UA Metrics ===")
        fmt.Printf("Total requests: %v\n", m["requests_total"])
        fmt.Printf("Successful requests: %v\n", m["requests_success"])
        fmt.Printf("Failed requests: %v\n", m["requests_errors"])
        fmt.Printf("Reconnections: %v\n", m["reconnections"])
        fmt.Printf("Active connections: %v\n", m["active_connections"])
        fmt.Printf("Active sessions: %v\n", m["active_sessions"])
        fmt.Printf("Subscriptions: %v\n", m["active_subscriptions"])
        fmt.Printf("Latency P50: %v\n", m["latency_p50"])
        fmt.Printf("Latency P99: %v\n", m["latency_p99"])
        fmt.Println()
    }
}
```
