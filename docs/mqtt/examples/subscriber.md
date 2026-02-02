# Subscriber Examples

MQTT message subscription examples.

## Basic Subscriber

```go
package main

import (
    "context"
    "log"
    "os"
    "os/signal"

    "github.com/edgeo/drivers/mqtt/mqtt"
)

func main() {
    handler := func(c *mqtt.Client, msg *mqtt.Message) {
        log.Printf("Received on %s: %s", msg.Topic, string(msg.Payload))
    }

    client := mqtt.NewClient(
        mqtt.WithServer("mqtt://localhost:1883"),
        mqtt.WithClientID("basic-subscriber"),
        mqtt.WithDefaultMessageHandler(handler),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(ctx)

    token := client.Subscribe(ctx, "test/topic", mqtt.QoS1, handler)
    if err := token.Wait(); err != nil {
        log.Fatal(err)
    }
    log.Println("Subscribed to test/topic")

    // Wait for Ctrl+C
    sigCh := make(chan os.Signal, 1)
    signal.Notify(sigCh, os.Interrupt)
    <-sigCh

    log.Println("Shutting down...")
}
```

## Subscriber with Wildcards

```go
package main

import (
    "context"
    "log"
    "os"
    "os/signal"

    "github.com/edgeo/drivers/mqtt/mqtt"
)

func main() {
    handler := func(c *mqtt.Client, msg *mqtt.Message) {
        log.Printf("[%s] %s", msg.Topic, string(msg.Payload))
    }

    client := mqtt.NewClient(
        mqtt.WithServer("mqtt://localhost:1883"),
        mqtt.WithClientID("wildcard-subscriber"),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(ctx)

    // Single-level wildcard: sensors/+/temperature
    // Matches: sensors/room1/temperature, sensors/room2/temperature
    // Does not match: sensors/building1/room1/temperature
    client.Subscribe(ctx, "sensors/+/temperature", mqtt.QoS1, handler)

    // Multi-level wildcard: sensors/#
    // Matches: sensors/anything, sensors/room1/temp, sensors/a/b/c/d
    client.Subscribe(ctx, "alerts/#", mqtt.QoS1, handler)

    log.Println("Subscribed to topics with wildcards")

    sigCh := make(chan os.Signal, 1)
    signal.Notify(sigCh, os.Interrupt)
    <-sigCh
}
```

## Multi-Topic Subscriber

```go
package main

import (
    "context"
    "log"
    "os"
    "os/signal"

    "github.com/edgeo/drivers/mqtt/mqtt"
)

func main() {
    client := mqtt.NewClient(
        mqtt.WithServer("mqtt://localhost:1883"),
        mqtt.WithClientID("multi-subscriber"),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(ctx)

    // Handler for each data type
    handler := func(c *mqtt.Client, msg *mqtt.Message) {
        log.Printf("Received: topic=%s payload=%s qos=%d retain=%v",
            msg.Topic, string(msg.Payload), msg.QoS, msg.Retain)
    }

    // Subscribe to multiple topics in one request
    subs := []mqtt.Subscription{
        {Topic: "sensors/temperature", QoS: mqtt.QoS1},
        {Topic: "sensors/humidity", QoS: mqtt.QoS1},
        {Topic: "sensors/pressure", QoS: mqtt.QoS0},
        {Topic: "alerts/critical", QoS: mqtt.QoS2},
    }

    token := client.SubscribeMultiple(ctx, subs, handler)
    if err := token.Wait(); err != nil {
        log.Fatal(err)
    }

    // Check granted QoS
    for i, qos := range token.GrantedQoS {
        log.Printf("Topic %s: requested QoS=%d, granted=%d",
            subs[i].Topic, subs[i].QoS, qos)
    }

    sigCh := make(chan os.Signal, 1)
    signal.Notify(sigCh, os.Interrupt)
    <-sigCh
}
```

## JSON Subscriber with Decoding

```go
package main

import (
    "context"
    "encoding/json"
    "log"
    "os"
    "os/signal"

    "github.com/edgeo/drivers/mqtt/mqtt"
)

type SensorData struct {
    DeviceID    string  `json:"device_id"`
    Temperature float64 `json:"temperature"`
    Humidity    float64 `json:"humidity"`
    Timestamp   string  `json:"timestamp"`
}

func main() {
    handler := func(c *mqtt.Client, msg *mqtt.Message) {
        var data SensorData
        if err := json.Unmarshal(msg.Payload, &data); err != nil {
            log.Printf("JSON decode error: %v", err)
            return
        }

        log.Printf("Sensor %s: temp=%.1fC humidity=%.1f%% time=%s",
            data.DeviceID, data.Temperature, data.Humidity, data.Timestamp)

        // Alerts
        if data.Temperature > 30 {
            log.Printf("ALERT: High temperature on %s!", data.DeviceID)
        }
    }

    client := mqtt.NewClient(
        mqtt.WithServer("mqtt://localhost:1883"),
        mqtt.WithClientID("json-subscriber"),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(ctx)

    client.Subscribe(ctx, "sensors/+/data", mqtt.QoS1, handler)
    log.Println("Waiting for sensor data...")

    sigCh := make(chan os.Signal, 1)
    signal.Notify(sigCh, os.Interrupt)
    <-sigCh
}
```

## Subscriber with Persistent Session

```go
package main

import (
    "context"
    "log"
    "os"
    "os/signal"
    "time"

    "github.com/edgeo/drivers/mqtt/mqtt"
)

func main() {
    handler := func(c *mqtt.Client, msg *mqtt.Message) {
        log.Printf("Received: %s -> %s", msg.Topic, string(msg.Payload))
    }

    client := mqtt.NewClient(
        mqtt.WithServer("mqtt://localhost:1883"),
        mqtt.WithClientID("persistent-subscriber"), // Fixed ID required
        mqtt.WithCleanStart(false),                 // Resume session
        mqtt.WithSessionExpiryInterval(86400),      // Session expires after 24h
        mqtt.WithOnConnect(func(c *mqtt.Client) {
            log.Println("Connected")
            // Subscriptions are preserved in the session
        }),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(ctx)

    // Subscribe only if new session
    // (subscriptions are preserved otherwise)
    token := client.Subscribe(ctx, "important/messages", mqtt.QoS1, handler)
    token.Wait()

    log.Println("Persistent session active")
    log.Println("QoS1/2 messages will be stored during your absence")

    sigCh := make(chan os.Signal, 1)
    signal.Notify(sigCh, os.Interrupt)
    <-sigCh

    // Normal disconnect - session is preserved
    // Messages arriving during disconnection will be received on reconnect
}
```

## Subscriber with Different Handlers

```go
package main

import (
    "context"
    "encoding/json"
    "log"
    "os"
    "os/signal"

    "github.com/edgeo/drivers/mqtt/mqtt"
)

func main() {
    client := mqtt.NewClient(
        mqtt.WithServer("mqtt://localhost:1883"),
        mqtt.WithClientID("multi-handler-subscriber"),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(ctx)

    // Temperature handler
    tempHandler := func(c *mqtt.Client, msg *mqtt.Message) {
        log.Printf("Temperature: %s", string(msg.Payload))
    }

    // Humidity handler
    humidityHandler := func(c *mqtt.Client, msg *mqtt.Message) {
        log.Printf("Humidity: %s", string(msg.Payload))
    }

    // Alert handler
    alertHandler := func(c *mqtt.Client, msg *mqtt.Message) {
        log.Printf("ALERT: %s", string(msg.Payload))
        // Send notification, email, etc.
    }

    // Command handler
    commandHandler := func(c *mqtt.Client, msg *mqtt.Message) {
        log.Printf("Command received: %s", string(msg.Payload))

        var cmd struct {
            Action string `json:"action"`
        }
        json.Unmarshal(msg.Payload, &cmd)

        // Reply if response topic specified
        if msg.Properties != nil && msg.Properties.ResponseTopic != "" {
            response := []byte(`{"status":"ok"}`)
            c.PublishWithProperties(ctx, msg.Properties.ResponseTopic, response, mqtt.QoS1, false,
                &mqtt.Properties{CorrelationData: msg.Properties.CorrelationData})
        }
    }

    // Subscribe with specific handlers
    client.Subscribe(ctx, "sensors/+/temperature", mqtt.QoS1, tempHandler)
    client.Subscribe(ctx, "sensors/+/humidity", mqtt.QoS1, humidityHandler)
    client.Subscribe(ctx, "alerts/#", mqtt.QoS2, alertHandler)
    client.Subscribe(ctx, "commands/my-device", mqtt.QoS1, commandHandler)

    log.Println("Listening on multiple topics with different handlers...")

    sigCh := make(chan os.Signal, 1)
    signal.Notify(sigCh, os.Interrupt)
    <-sigCh
}
```

## Subscriber with Reconnection and Resubscription

```go
package main

import (
    "context"
    "log"
    "os"
    "os/signal"
    "time"

    "github.com/edgeo/drivers/mqtt/mqtt"
)

func main() {
    handler := func(c *mqtt.Client, msg *mqtt.Message) {
        log.Printf("Message: %s -> %s", msg.Topic, string(msg.Payload))
    }

    topics := []string{"sensors/#", "commands/device-001", "status/+"}

    client := mqtt.NewClient(
        mqtt.WithServer("mqtt://localhost:1883"),
        mqtt.WithClientID("resilient-subscriber"),
        mqtt.WithAutoReconnect(true),
        mqtt.WithConnectRetryInterval(time.Second),
        mqtt.WithMaxReconnectInterval(30*time.Second),
        mqtt.WithOnConnect(func(c *mqtt.Client) {
            log.Println("Connected - resubscribing to topics...")

            for _, topic := range topics {
                token := c.Subscribe(context.Background(), topic, mqtt.QoS1, handler)
                if err := token.Wait(); err != nil {
                    log.Printf("Subscribe error %s: %v", topic, err)
                } else {
                    log.Printf("Subscribed to %s", topic)
                }
            }
        }),
        mqtt.WithOnConnectionLost(func(c *mqtt.Client, err error) {
            log.Printf("Connection lost: %v - automatic reconnection...", err)
        }),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(ctx)

    sigCh := make(chan os.Signal, 1)
    signal.Notify(sigCh, os.Interrupt)
    <-sigCh
}
```

## Subscriber with Unsubscribe

```go
package main

import (
    "context"
    "log"
    "time"

    "github.com/edgeo/drivers/mqtt/mqtt"
)

func main() {
    handler := func(c *mqtt.Client, msg *mqtt.Message) {
        log.Printf("Received: %s", string(msg.Payload))
    }

    client := mqtt.NewClient(
        mqtt.WithServer("mqtt://localhost:1883"),
        mqtt.WithClientID("unsub-demo"),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Disconnect(ctx)

    // Subscribe
    client.Subscribe(ctx, "test/topic", mqtt.QoS1, handler)
    log.Println("Subscribed to test/topic")

    time.Sleep(10 * time.Second)

    // Unsubscribe
    token := client.Unsubscribe(ctx, "test/topic")
    if err := token.Wait(); err != nil {
        log.Printf("Unsubscribe error: %v", err)
    }
    log.Println("Unsubscribed from test/topic")

    time.Sleep(5 * time.Second)
}
```
