---
sidebar_position: 1
---

# Example: Basic Client

This example shows how to create an OPC UA client and perform basic operations.

## Complete Code

```go
// examples/client/main.go
package main

import (
    "context"
    "fmt"
    "log"
    "time"

    "github.com/edgeo/drivers/opcua"
)

func main() {
    // Create the client
    client, err := opcua.NewClient("localhost:4840",
        opcua.WithEndpoint("opc.tcp://localhost:4840"),
        opcua.WithTimeout(10*time.Second),
        opcua.WithSessionName("Example Client"),
        opcua.WithAutoReconnect(true),
    )
    if err != nil {
        log.Fatalf("Error creating client: %v", err)
    }
    defer client.Close()

    ctx := context.Background()

    // Connect and activate session
    log.Println("Connecting to OPC UA server...")
    if err := client.ConnectAndActivateSession(ctx); err != nil {
        log.Fatalf("Connection error: %v", err)
    }
    log.Println("Connected!")

    // 1. Address space navigation
    log.Println("\n=== Navigation (Browse) ===")
    browseExample(ctx, client)

    // 2. Reading values
    log.Println("\n=== Reading (Read) ===")
    readExample(ctx, client)

    // 3. Writing values
    log.Println("\n=== Writing (Write) ===")
    writeExample(ctx, client)

    // 4. Subscription
    log.Println("\n=== Subscription ===")
    subscribeExample(ctx, client)

    // Display metrics
    log.Println("\n=== Metrics ===")
    printMetrics(client)

    log.Println("\nDone!")
}

func browseExample(ctx context.Context, client *opcua.Client) {
    // Browse from the Objects folder (i=85)
    refs, err := client.BrowseNode(ctx,
        opcua.NewNumericNodeID(0, 85),
        opcua.BrowseDirectionForward,
    )
    if err != nil {
        log.Printf("Browse error: %v", err)
        return
    }

    fmt.Printf("Nodes found in Objects:\n")
    for _, ref := range refs {
        fmt.Printf("  - %s (NodeID: %s, Type: %s)\n",
            ref.DisplayName.Text,
            formatNodeID(ref.NodeID),
            ref.NodeClass)
    }
}

func readExample(ctx context.Context, client *opcua.Client) {
    // Read multiple attributes
    nodesToRead := []opcua.ReadValueID{
        {NodeID: opcua.NewNumericNodeID(0, 2256), AttributeID: opcua.AttributeValue},      // ServerStatus
        {NodeID: opcua.NewNumericNodeID(0, 2258), AttributeID: opcua.AttributeValue},      // CurrentTime
        {NodeID: opcua.NewNumericNodeID(0, 2256), AttributeID: opcua.AttributeDisplayName}, // ServerStatus DisplayName
    }

    results, err := client.Read(ctx, nodesToRead)
    if err != nil {
        log.Printf("Read error: %v", err)
        return
    }

    for i, result := range results {
        if result.StatusCode.IsBad() {
            fmt.Printf("Read %d: Error %s\n", i, result.StatusCode)
        } else {
            fmt.Printf("Read %d: %v (Type: %s)\n", i,
                result.Value.Value,
                getTypeName(result.Value.Type))
        }
    }
}

func writeExample(ctx context.Context, client *opcua.Client) {
    // Note: This operation requires a server with writable nodes
    nodeID := opcua.NewNumericNodeID(2, 1) // Example: ns=2;i=1

    err := client.WriteValue(ctx, nodeID, &opcua.Variant{
        Type:  opcua.TypeDouble,
        Value: 42.5,
    })
    if err != nil {
        log.Printf("Write error (expected if node not available): %v", err)
        return
    }

    fmt.Println("Value written successfully!")

    // Read back to verify
    value, err := client.ReadValue(ctx, nodeID)
    if err != nil {
        log.Printf("Read back error: %v", err)
        return
    }
    fmt.Printf("New value: %v\n", value.Value.Value)
}

func subscribeExample(ctx context.Context, client *opcua.Client) {
    // Create a subscription
    sub, err := client.CreateSubscription(ctx,
        opcua.WithPublishingInterval(1000),
    )
    if err != nil {
        log.Printf("Subscription creation error: %v", err)
        return
    }
    defer sub.Delete(context.Background())

    fmt.Printf("Subscription created (ID: %d, Interval: %.0fms)\n",
        sub.ID, sub.RevisedPublishingInterval)

    // Create monitored items
    items, err := sub.CreateMonitoredItems(ctx, []opcua.ReadValueID{
        {NodeID: opcua.NewNumericNodeID(0, 2258), AttributeID: opcua.AttributeValue}, // CurrentTime
    })
    if err != nil {
        log.Printf("Monitored item creation error: %v", err)
        return
    }

    fmt.Printf("Monitored items created: %d\n", len(items))

    // Wait for some notifications
    fmt.Println("Waiting for notifications (5 seconds)...")
    timeout := time.After(5 * time.Second)
    count := 0

    for {
        select {
        case notif := <-sub.Notifications():
            count++
            fmt.Printf("  Notification %d: %v\n", count, notif.Value.Value)
        case <-timeout:
            fmt.Printf("Notifications received: %d\n", count)
            return
        }
    }
}

func printMetrics(client *opcua.Client) {
    m := client.Metrics().Collect()
    fmt.Printf("Total requests: %v\n", m["requests_total"])
    fmt.Printf("Successful requests: %v\n", m["requests_success"])
    fmt.Printf("Failed requests: %v\n", m["requests_errors"])
}

func formatNodeID(n opcua.NodeID) string {
    switch n.Type {
    case opcua.NodeIDTypeNumeric:
        if n.Namespace == 0 {
            return fmt.Sprintf("i=%d", n.Numeric)
        }
        return fmt.Sprintf("ns=%d;i=%d", n.Namespace, n.Numeric)
    case opcua.NodeIDTypeString:
        if n.Namespace == 0 {
            return fmt.Sprintf("s=%s", n.String)
        }
        return fmt.Sprintf("ns=%d;s=%s", n.Namespace, n.String)
    default:
        return fmt.Sprintf("%v", n)
    }
}

func getTypeName(t opcua.TypeID) string {
    switch t {
    case opcua.TypeBoolean:
        return "Boolean"
    case opcua.TypeInt32:
        return "Int32"
    case opcua.TypeDouble:
        return "Double"
    case opcua.TypeString:
        return "String"
    case opcua.TypeDateTime:
        return "DateTime"
    default:
        return fmt.Sprintf("Type(%d)", t)
    }
}
```

## Running

```bash
# Build
go build -o client ./examples/client

# Run (requires an OPC UA server on localhost:4840)
./client
```

## Expected Output

```
Connecting to OPC UA server...
Connected!

=== Navigation (Browse) ===
Nodes found in Objects:
  - Server (NodeID: i=2253, Type: Object)
  - DeviceSet (NodeID: ns=2;i=1, Type: Object)

=== Reading (Read) ===
Read 0: {State: Running, ...} (Type: ExtensionObject)
Read 1: 2024-02-01T10:30:00Z (Type: DateTime)
Read 2: ServerStatus (Type: LocalizedText)

=== Writing (Write) ===
Value written successfully!
New value: 42.5

=== Subscription ===
Subscription created (ID: 1, Interval: 1000ms)
Monitored items created: 1
Waiting for notifications (5 seconds)...
  Notification 1: 2024-02-01T10:30:01Z
  Notification 2: 2024-02-01T10:30:02Z
  Notification 3: 2024-02-01T10:30:03Z
  Notification 4: 2024-02-01T10:30:04Z
  Notification 5: 2024-02-01T10:30:05Z
Notifications received: 5

=== Metrics ===
Total requests: 12
Successful requests: 12
Failed requests: 0

Done!
```

## Key Points

1. **Always close the client** with `defer client.Close()`
2. **Use a context** for operations with timeout
3. **Check StatusCodes** for read/write results
4. **Clean up subscriptions** with `defer sub.Delete()`
