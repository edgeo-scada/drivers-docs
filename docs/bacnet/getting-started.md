# Getting Started

This guide will help you get started with the BACnet client library.

## Installation

```bash
go get github.com/edgeo/drivers/bacnet
```

## Basic Connection

```go
package main

import (
    "context"
    "log"
    "time"

    "github.com/edgeo/drivers/bacnet/bacnet"
)

func main() {
    // Create client
    client := bacnet.NewClient(
        bacnet.WithTimeout(3*time.Second),
        bacnet.WithRetries(3),
    )

    // Connect (binds to local UDP port)
    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatalf("Connection failed: %v", err)
    }
    defer client.Close()

    log.Println("BACnet client connected")
}
```

## Device Discovery

Use WhoIs to discover BACnet devices on the network:

```go
// Discover all devices
devices, err := client.WhoIs(ctx)
if err != nil {
    log.Fatal(err)
}

for _, device := range devices {
    log.Printf("Device %d: %s at %s",
        device.InstanceID,
        device.ObjectName,
        device.Address)
}

// Discover specific device range
devices, err := client.WhoIs(ctx,
    bacnet.WithDeviceIDRange(1000, 2000),
)
```

## Reading Properties

### Read Single Property

```go
// Read present value of Analog Input 0
value, err := client.ReadProperty(ctx,
    1234,                           // Device instance ID
    bacnet.ObjectAnalogInput(0),    // Object identifier
    bacnet.PropertyPresentValue,    // Property ID
)
if err != nil {
    log.Fatal(err)
}
log.Printf("Value: %v", value)
```

### Read with Array Index

```go
// Read priority array element 8
value, err := client.ReadProperty(ctx,
    1234,
    bacnet.ObjectAnalogOutput(0),
    bacnet.PropertyPriorityArray,
    bacnet.WithArrayIndex(8),
)
```

### Read Multiple Properties

```go
// Define what to read
requests := []bacnet.ReadRequest{
    {Object: bacnet.ObjectAnalogInput(0), Property: bacnet.PropertyPresentValue},
    {Object: bacnet.ObjectAnalogInput(0), Property: bacnet.PropertyObjectName},
    {Object: bacnet.ObjectAnalogInput(1), Property: bacnet.PropertyPresentValue},
    {Object: bacnet.ObjectBinaryInput(0), Property: bacnet.PropertyPresentValue},
}

// Read all in one request
results, err := client.ReadPropertyMultiple(ctx, 1234, requests)
if err != nil {
    log.Fatal(err)
}

for _, result := range results {
    log.Printf("%s.%s = %v",
        result.Object,
        result.Property,
        result.Value)
}
```

## Writing Properties

### Write Single Property

```go
// Write present value to Analog Output 0
err := client.WriteProperty(ctx,
    1234,
    bacnet.ObjectAnalogOutput(0),
    bacnet.PropertyPresentValue,
    72.5, // Value to write
)
if err != nil {
    log.Fatal(err)
}
```

### Write with Priority

BACnet uses a 16-level priority array. Priority 1 is highest (Manual-Life Safety), 16 is lowest (default).

```go
// Write with priority 8 (Manual Operator)
err := client.WriteProperty(ctx,
    1234,
    bacnet.ObjectAnalogOutput(0),
    bacnet.PropertyPresentValue,
    72.5,
    bacnet.WithPriority(8),
)
```

### Common Priority Levels

| Priority | Name | Usage |
|----------|------|-------|
| 1 | Manual-Life Safety | Fire/smoke control |
| 2 | Automatic-Life Safety | Emergency systems |
| 5 | Critical Equipment | Critical process control |
| 8 | Manual Operator | Operator overrides |
| 16 | Default | Normal operation |

## Object Identifiers

Create object identifiers using helper functions:

```go
// Analog types
ai := bacnet.ObjectAnalogInput(0)    // AI:0
ao := bacnet.ObjectAnalogOutput(1)   // AO:1
av := bacnet.ObjectAnalogValue(2)    // AV:2

// Binary types
bi := bacnet.ObjectBinaryInput(0)    // BI:0
bo := bacnet.ObjectBinaryOutput(1)   // BO:1
bv := bacnet.ObjectBinaryValue(2)    // BV:2

// Multi-state types
msi := bacnet.ObjectMultiStateInput(0)   // MSI:0
mso := bacnet.ObjectMultiStateOutput(1)  // MSO:1

// Device
dev := bacnet.ObjectDevice(1234)     // DEV:1234
```

## COV Subscriptions

Subscribe to property changes:

```go
// Handler for COV notifications
handler := func(notification *bacnet.COVNotification) {
    log.Printf("COV: %s.%s changed to %v",
        notification.Object,
        notification.Property,
        notification.Value)
}

// Subscribe to AI:0 present value changes
subID, err := client.SubscribeCOV(ctx,
    1234,
    bacnet.ObjectAnalogInput(0),
    handler,
    bacnet.WithSubscriptionLifetime(300), // 5 minutes
)
if err != nil {
    log.Fatal(err)
}

// Later, unsubscribe
err = client.UnsubscribeCOV(ctx, 1234, bacnet.ObjectAnalogInput(0), subID)
```

## Error Handling

```go
value, err := client.ReadProperty(ctx, deviceID, object, property)
if err != nil {
    switch {
    case errors.Is(err, bacnet.ErrDeviceNotFound):
        log.Printf("Device %d not found", deviceID)
    case errors.Is(err, bacnet.ErrObjectNotFound):
        log.Printf("Object does not exist")
    case errors.Is(err, bacnet.ErrPropertyNotFound):
        log.Printf("Property not supported")
    case errors.Is(err, bacnet.ErrTimeout):
        log.Printf("Request timed out")
    default:
        log.Printf("Error: %v", err)
    }
}
```

## BBMD Configuration

For cross-subnet communication, configure BBMD (BACnet Broadcast Management Device):

```go
client := bacnet.NewClient(
    bacnet.WithBBMD("192.168.1.1", 47808, 300), // Address, port, TTL
)
```

## Next Steps

- Learn about the [Client API](client.md)
- Configure [Options](options.md)
- Handle [Errors](errors.md)
- Try the [CLI Tool](cli.md)
