# Publisher Examples

MQTT message publishing examples.

## Basic Publisher

```go
package main

import (
    "context"
    "log"
    "time"

    "github.com/edgeo/drivers/mqtt/mqtt"
)

func main() {
    client := mqtt.NewClient(
        mqtt.WithServer("mqtt://localhost:1883"),
        mqtt.WithClientID("basic-publisher"),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(ctx)

    // Simple publish
    token := client.Publish(ctx, "test/topic", []byte("Hello!"), mqtt.QoS1, false)
    if err := token.Wait(); err != nil {
        log.Fatal(err)
    }

    log.Println("Message published")
}
```

## Periodic Publisher

```go
package main

import (
    "context"
    "fmt"
    "log"
    "os"
    "os/signal"
    "time"

    "github.com/edgeo/drivers/mqtt/mqtt"
)

func main() {
    client := mqtt.NewClient(
        mqtt.WithServer("mqtt://localhost:1883"),
        mqtt.WithClientID("periodic-publisher"),
        mqtt.WithAutoReconnect(true),
        mqtt.WithOnConnect(func(c *mqtt.Client) {
            log.Println("Connected")
        }),
        mqtt.WithOnConnectionLost(func(c *mqtt.Client, err error) {
            log.Printf("Disconnected: %v", err)
        }),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(ctx)

    // Publish every second
    ticker := time.NewTicker(time.Second)
    defer ticker.Stop()

    sigCh := make(chan os.Signal, 1)
    signal.Notify(sigCh, os.Interrupt)

    count := 0
    for {
        select {
        case <-sigCh:
            log.Println("Shutting down...")
            return
        case <-ticker.C:
            count++
            payload := fmt.Sprintf("Message #%d at %s", count, time.Now().Format(time.RFC3339))

            token := client.Publish(ctx, "test/messages", []byte(payload), mqtt.QoS1, false)
            if err := token.Wait(); err != nil {
                log.Printf("Error: %v", err)
                continue
            }
            log.Printf("Published: %s", payload)
        }
    }
}
```

## JSON Publisher

```go
package main

import (
    "context"
    "encoding/json"
    "log"
    "math/rand"
    "os"
    "os/signal"
    "time"

    "github.com/edgeo/drivers/mqtt/mqtt"
)

type SensorData struct {
    DeviceID    string  `json:"device_id"`
    Temperature float64 `json:"temperature"`
    Humidity    float64 `json:"humidity"`
    Timestamp   string  `json:"timestamp"`
}

func main() {
    client := mqtt.NewClient(
        mqtt.WithServer("mqtt://localhost:1883"),
        mqtt.WithClientID("sensor-publisher"),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(ctx)

    ticker := time.NewTicker(2 * time.Second)
    defer ticker.Stop()

    sigCh := make(chan os.Signal, 1)
    signal.Notify(sigCh, os.Interrupt)

    for {
        select {
        case <-sigCh:
            return
        case <-ticker.C:
            data := SensorData{
                DeviceID:    "sensor-001",
                Temperature: 20.0 + rand.Float64()*10,
                Humidity:    40.0 + rand.Float64()*40,
                Timestamp:   time.Now().Format(time.RFC3339),
            }

            payload, _ := json.Marshal(data)
            token := client.Publish(ctx, "sensors/sensor-001/data", payload, mqtt.QoS1, false)
            if err := token.Wait(); err != nil {
                log.Printf("Error: %v", err)
            }
        }
    }
}
```

## Publisher with MQTT 5.0 Properties

```go
package main

import (
    "context"
    "log"
    "time"

    "github.com/edgeo/drivers/mqtt/mqtt"
)

func main() {
    client := mqtt.NewClient(
        mqtt.WithServer("mqtt://localhost:1883"),
        mqtt.WithClientID("mqtt5-publisher"),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(ctx)

    // MQTT 5.0 properties
    msgExpiry := uint32(3600) // 1 hour
    payloadFormat := byte(1) // UTF-8

    props := &mqtt.Properties{
        PayloadFormat:   &payloadFormat,
        MessageExpiry:   &msgExpiry,
        ContentType:     "application/json",
        ResponseTopic:   "responses/my-request",
        CorrelationData: []byte("request-123"),
        UserProperties: []mqtt.UserProperty{
            {Key: "source", Value: "sensor-gateway"},
            {Key: "priority", Value: "high"},
        },
    }

    payload := []byte(`{"command": "get_status"}`)
    token := client.PublishWithProperties(ctx, "commands/device-001", payload, mqtt.QoS1, false, props)
    if err := token.Wait(); err != nil {
        log.Fatal(err)
    }

    log.Println("Request sent, waiting for response on responses/my-request")

    // Wait for response...
    time.Sleep(10 * time.Second)
}
```

## Publisher with Retain

```go
package main

import (
    "context"
    "log"

    "github.com/edgeo/drivers/mqtt/mqtt"
)

func main() {
    client := mqtt.NewClient(
        mqtt.WithServer("mqtt://localhost:1883"),
        mqtt.WithClientID("retain-publisher"),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(ctx)

    // Retained message - new subscribers will receive it immediately
    token := client.Publish(ctx, "status/device-001", []byte("online"), mqtt.QoS1, true)
    if err := token.Wait(); err != nil {
        log.Fatal(err)
    }
    log.Println("Retained status published")

    // To delete a retained message, publish empty payload with retain=true
    // client.Publish(ctx, "status/device-001", []byte{}, mqtt.QoS1, true)
}
```

## QoS 2 Publisher

```go
package main

import (
    "context"
    "log"

    "github.com/edgeo/drivers/mqtt/mqtt"
)

func main() {
    client := mqtt.NewClient(
        mqtt.WithServer("mqtt://localhost:1883"),
        mqtt.WithClientID("qos2-publisher"),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(ctx)

    // QoS 2 - Exactly once delivery
    // Used for critical transactions
    payload := []byte(`{"transaction_id": "tx-12345", "amount": 100.00}`)

    token := client.Publish(ctx, "transactions/payments", payload, mqtt.QoS2, false)
    if err := token.Wait(); err != nil {
        log.Fatal(err)
    }

    log.Println("Transaction published with QoS 2 (exactly once)")
}
```

## High-Performance Publisher with Pool

```go
package main

import (
    "context"
    "fmt"
    "log"
    "sync"
    "time"

    "github.com/edgeo/drivers/mqtt/mqtt"
)

func main() {
    pool := mqtt.NewPool(
        mqtt.WithPoolSize(10),
        mqtt.WithPoolClientOptions(
            mqtt.WithServer("mqtt://localhost:1883"),
            mqtt.WithAutoReconnect(true),
        ),
    )

    ctx := context.Background()
    if err := pool.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer pool.Close()

    // Publish 10000 messages in parallel
    var wg sync.WaitGroup
    start := time.Now()

    for i := 0; i < 10000; i++ {
        wg.Add(1)
        go func(n int) {
            defer wg.Done()

            topic := fmt.Sprintf("test/msg/%d", n%100)
            payload := []byte(fmt.Sprintf("Message %d", n))

            if err := pool.Publish(ctx, topic, payload, mqtt.QoS0, false); err != nil {
                log.Printf("Error: %v", err)
            }
        }(i)
    }

    wg.Wait()
    elapsed := time.Since(start)

    log.Printf("10000 messages published in %v (%.0f msg/s)",
        elapsed, 10000/elapsed.Seconds())
}
```
