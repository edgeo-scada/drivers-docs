# Metrics and Monitoring

Documentation of built-in metrics for monitoring the MQTT client.

## Overview

The library provides built-in metrics to monitor:
- Connections and reconnections
- Messages sent and received
- Operation latency
- Errors

## Accessing Metrics

### Client Metrics

```go
metrics := client.Metrics()
```

### Metrics Snapshot

```go
snapshot := metrics.Snapshot()
```

## Metrics Structure

### Metrics

```go
type Metrics struct {
    // Connections
    ConnectionAttempts Counter  // Connection attempts
    ActiveConnections  Gauge    // Active connections
    ReconnectAttempts  Counter  // Reconnection attempts

    // Packets
    PacketsSent     Counter     // Packets sent
    PacketsReceived Counter     // Packets received

    // Messages
    MessagesSent     Counter    // Published messages
    MessagesReceived Counter    // Received messages

    // Errors
    Errors Counter              // Total errors

    // Latency
    PublishLatency   *LatencyHistogram  // Publish latency
    SubscribeLatency *LatencyHistogram  // Subscribe latency
    ConnectLatency   *LatencyHistogram  // Connection latency

    // Time
    StartTime time.Time         // Start time
}
```

### MetricsSnapshot

```go
type MetricsSnapshot struct {
    ConnectionAttempts int64
    ActiveConnections  int64
    ReconnectAttempts  int64
    PacketsSent        int64
    PacketsReceived    int64
    MessagesSent       int64
    MessagesReceived   int64
    Errors             int64
    PublishLatency     LatencyStats
    SubscribeLatency   LatencyStats
    ConnectLatency     LatencyStats
    Uptime             time.Duration
}
```

## Metric Types

### Counter

Monotonically increasing counter.

```go
type Counter struct {
    value int64
}

func (c *Counter) Add(delta int64)  // Increment
func (c *Counter) Value() int64     // Current value
func (c *Counter) Reset()           // Reset
```

### Gauge

Value that can increase or decrease.

```go
type Gauge struct {
    value int64
}

func (g *Gauge) Set(value int64)    // Set value
func (g *Gauge) Add(delta int64)    // Add/subtract
func (g *Gauge) Value() int64       // Current value
```

### LatencyHistogram

Latency histogram with statistics.

```go
type LatencyHistogram struct {
    // ...
}

func (h *LatencyHistogram) Observe(latencyMs int64)
func (h *LatencyHistogram) ObserveDuration(d time.Duration)
func (h *LatencyHistogram) Stats() LatencyStats
```

### LatencyStats

Latency statistics.

```go
type LatencyStats struct {
    Count int64   // Number of observations
    Sum   int64   // Sum of latencies (ms)
    Min   int64   // Minimum latency (ms)
    Max   int64   // Maximum latency (ms)
    Avg   float64 // Average latency (ms)
}
```

## Usage Examples

### Basic Monitoring

```go
func printMetrics(client *mqtt.Client) {
    snapshot := client.Metrics().Snapshot()

    fmt.Printf("=== MQTT Metrics ===\n")
    fmt.Printf("Uptime: %v\n", snapshot.Uptime)
    fmt.Printf("Active connections: %d\n", snapshot.ActiveConnections)
    fmt.Printf("Connection attempts: %d\n", snapshot.ConnectionAttempts)
    fmt.Printf("Reconnect attempts: %d\n", snapshot.ReconnectAttempts)
    fmt.Printf("Messages sent: %d\n", snapshot.MessagesSent)
    fmt.Printf("Messages received: %d\n", snapshot.MessagesReceived)
    fmt.Printf("Packets sent: %d\n", snapshot.PacketsSent)
    fmt.Printf("Packets received: %d\n", snapshot.PacketsReceived)
    fmt.Printf("Errors: %d\n", snapshot.Errors)

    if snapshot.PublishLatency.Count > 0 {
        fmt.Printf("Publish latency: avg=%.2fms min=%dms max=%dms\n",
            snapshot.PublishLatency.Avg,
            snapshot.PublishLatency.Min,
            snapshot.PublishLatency.Max)
    }
}
```

### Periodic Monitoring

```go
func startMetricsReporter(client *mqtt.Client, interval time.Duration) {
    ticker := time.NewTicker(interval)

    var lastSent, lastRecv int64

    go func() {
        for range ticker.C {
            snapshot := client.Metrics().Snapshot()

            // Calculate throughput
            sentRate := snapshot.MessagesSent - lastSent
            recvRate := snapshot.MessagesReceived - lastRecv
            lastSent = snapshot.MessagesSent
            lastRecv = snapshot.MessagesReceived

            log.Printf("MQTT stats: sent=%d/s recv=%d/s connected=%d errors=%d",
                sentRate/int64(interval.Seconds()),
                recvRate/int64(interval.Seconds()),
                snapshot.ActiveConnections,
                snapshot.Errors)
        }
    }()
}
```

### Prometheus Export

```go
import (
    "net/http"

    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

type MQTTCollector struct {
    client *mqtt.Client

    connectionAttempts *prometheus.Desc
    activeConnections  *prometheus.Desc
    messagesSent       *prometheus.Desc
    messagesReceived   *prometheus.Desc
    publishLatency     *prometheus.Desc
}

func NewMQTTCollector(client *mqtt.Client) *MQTTCollector {
    return &MQTTCollector{
        client: client,
        connectionAttempts: prometheus.NewDesc(
            "mqtt_connection_attempts_total",
            "Total connection attempts",
            nil, nil,
        ),
        activeConnections: prometheus.NewDesc(
            "mqtt_active_connections",
            "Number of active connections",
            nil, nil,
        ),
        messagesSent: prometheus.NewDesc(
            "mqtt_messages_sent_total",
            "Total messages sent",
            nil, nil,
        ),
        messagesReceived: prometheus.NewDesc(
            "mqtt_messages_received_total",
            "Total messages received",
            nil, nil,
        ),
        publishLatency: prometheus.NewDesc(
            "mqtt_publish_latency_milliseconds",
            "Publish latency histogram",
            nil, nil,
        ),
    }
}

func (c *MQTTCollector) Describe(ch chan<- *prometheus.Desc) {
    ch <- c.connectionAttempts
    ch <- c.activeConnections
    ch <- c.messagesSent
    ch <- c.messagesReceived
    ch <- c.publishLatency
}

func (c *MQTTCollector) Collect(ch chan<- prometheus.Metric) {
    snapshot := c.client.Metrics().Snapshot()

    ch <- prometheus.MustNewConstMetric(
        c.connectionAttempts,
        prometheus.CounterValue,
        float64(snapshot.ConnectionAttempts),
    )
    ch <- prometheus.MustNewConstMetric(
        c.activeConnections,
        prometheus.GaugeValue,
        float64(snapshot.ActiveConnections),
    )
    ch <- prometheus.MustNewConstMetric(
        c.messagesSent,
        prometheus.CounterValue,
        float64(snapshot.MessagesSent),
    )
    ch <- prometheus.MustNewConstMetric(
        c.messagesReceived,
        prometheus.CounterValue,
        float64(snapshot.MessagesReceived),
    )
    ch <- prometheus.MustNewConstMetric(
        c.publishLatency,
        prometheus.GaugeValue,
        snapshot.PublishLatency.Avg,
    )
}

func main() {
    client := mqtt.NewClient(/* ... */)

    // Register the collector
    collector := NewMQTTCollector(client)
    prometheus.MustRegister(collector)

    // HTTP endpoint for Prometheus
    http.Handle("/metrics", promhttp.Handler())
    go http.ListenAndServe(":9090", nil)

    // ...
}
```

### JSON Export

```go
import "encoding/json"

func metricsHandler(client *mqtt.Client) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        snapshot := client.Metrics().Snapshot()

        response := map[string]interface{}{
            "uptime_seconds":       snapshot.Uptime.Seconds(),
            "active_connections":   snapshot.ActiveConnections,
            "connection_attempts":  snapshot.ConnectionAttempts,
            "reconnect_attempts":   snapshot.ReconnectAttempts,
            "messages_sent":        snapshot.MessagesSent,
            "messages_received":    snapshot.MessagesReceived,
            "packets_sent":         snapshot.PacketsSent,
            "packets_received":     snapshot.PacketsReceived,
            "errors":               snapshot.Errors,
            "publish_latency": map[string]interface{}{
                "count": snapshot.PublishLatency.Count,
                "avg":   snapshot.PublishLatency.Avg,
                "min":   snapshot.PublishLatency.Min,
                "max":   snapshot.PublishLatency.Max,
            },
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(response)
    }
}
```

### Alerting

```go
func startAlertChecker(client *mqtt.Client) {
    ticker := time.NewTicker(time.Minute)

    var lastErrors int64

    go func() {
        for range ticker.C {
            snapshot := client.Metrics().Snapshot()

            // Alert if too many errors
            errorRate := snapshot.Errors - lastErrors
            lastErrors = snapshot.Errors

            if errorRate > 10 {
                sendAlert(fmt.Sprintf("MQTT error rate high: %d errors/min", errorRate))
            }

            // Alert if disconnected
            if snapshot.ActiveConnections == 0 {
                sendAlert("MQTT client disconnected")
            }

            // Alert if high latency
            if snapshot.PublishLatency.Avg > 1000 {
                sendAlert(fmt.Sprintf("MQTT publish latency high: %.0fms",
                    snapshot.PublishLatency.Avg))
            }
        }
    }()
}

func sendAlert(message string) {
    log.Printf("ALERT: %s", message)
    // Send email, Slack, PagerDuty, etc.
}
```

## Pool Metrics

```go
poolMetrics := pool.Metrics()

fmt.Printf("Total clients: %d\n", poolMetrics.TotalClients.Value())
fmt.Printf("Healthy clients: %d\n", poolMetrics.HealthyClients.Value())
fmt.Printf("Total requests: %d\n", poolMetrics.TotalRequests.Value())
fmt.Printf("Failed requests: %d\n", poolMetrics.FailedRequests.Value())
```

## Reset

```go
// Reset all metrics
client.Metrics().Reset()
```
