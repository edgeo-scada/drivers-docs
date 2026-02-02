# Basic Client Example

This example demonstrates device discovery and property reading with BACnet.

## Complete Example

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

    ctx := context.Background()

    // Connect
    if err := client.Connect(ctx); err != nil {
        log.Fatalf("Connection failed: %v", err)
    }
    defer client.Close()

    log.Println("BACnet client connected")

    // Discover devices
    discoverDevices(ctx, client)

    // Read properties
    readProperties(ctx, client, 1234)

    // Read multiple properties
    readMultipleProperties(ctx, client, 1234)

    // Write property
    writeProperty(ctx, client, 1234)
}

func discoverDevices(ctx context.Context, client *bacnet.Client) {
    log.Println("\n=== Device Discovery ===")

    devices, err := client.WhoIs(ctx)
    if err != nil {
        log.Printf("Discovery error: %v", err)
        return
    }

    for _, device := range devices {
        log.Printf("Device %d: %s at %s",
            device.InstanceID,
            device.ObjectName,
            device.Address)
    }
}

func readProperties(ctx context.Context, client *bacnet.Client, deviceID uint32) {
    log.Println("\n=== Read Properties ===")

    // Read present value of AI:0
    value, err := client.ReadProperty(ctx,
        deviceID,
        bacnet.ObjectAnalogInput(0),
        bacnet.PropertyPresentValue,
    )
    if err != nil {
        log.Printf("Read error: %v", err)
    } else {
        log.Printf("AI:0 Present-Value: %v", value)
    }

    // Read object name
    name, err := client.ReadProperty(ctx,
        deviceID,
        bacnet.ObjectAnalogInput(0),
        bacnet.PropertyObjectName,
    )
    if err != nil {
        log.Printf("Read error: %v", err)
    } else {
        log.Printf("AI:0 Object-Name: %v", name)
    }

    // Read units
    units, err := client.ReadProperty(ctx,
        deviceID,
        bacnet.ObjectAnalogInput(0),
        bacnet.PropertyUnits,
    )
    if err != nil {
        log.Printf("Read error: %v", err)
    } else {
        log.Printf("AI:0 Units: %v", units)
    }

    // Read status flags
    flags, err := client.ReadProperty(ctx,
        deviceID,
        bacnet.ObjectAnalogInput(0),
        bacnet.PropertyStatusFlags,
    )
    if err != nil {
        log.Printf("Read error: %v", err)
    } else {
        log.Printf("AI:0 Status-Flags: %v", flags)
    }
}

func readMultipleProperties(ctx context.Context, client *bacnet.Client, deviceID uint32) {
    log.Println("\n=== Read Multiple Properties ===")

    requests := []bacnet.ReadRequest{
        {Object: bacnet.ObjectAnalogInput(0), Property: bacnet.PropertyPresentValue},
        {Object: bacnet.ObjectAnalogInput(0), Property: bacnet.PropertyObjectName},
        {Object: bacnet.ObjectAnalogInput(1), Property: bacnet.PropertyPresentValue},
        {Object: bacnet.ObjectAnalogInput(1), Property: bacnet.PropertyObjectName},
        {Object: bacnet.ObjectBinaryInput(0), Property: bacnet.PropertyPresentValue},
    }

    results, err := client.ReadPropertyMultiple(ctx, deviceID, requests)
    if err != nil {
        log.Printf("Read multiple error: %v", err)
        return
    }

    for _, r := range results {
        if r.Error != nil {
            log.Printf("%s.%s: error %v", r.Object, r.Property, r.Error)
        } else {
            log.Printf("%s.%s = %v", r.Object, r.Property, r.Value)
        }
    }
}

func writeProperty(ctx context.Context, client *bacnet.Client, deviceID uint32) {
    log.Println("\n=== Write Property ===")

    // Write setpoint with priority 8
    err := client.WriteProperty(ctx,
        deviceID,
        bacnet.ObjectAnalogValue(0),
        bacnet.PropertyPresentValue,
        72.0,
        bacnet.WithPriority(8),
    )
    if err != nil {
        log.Printf("Write error: %v", err)
    } else {
        log.Println("Written 72.0 to AV:0 at priority 8")
    }

    // Read back the value
    value, err := client.ReadProperty(ctx,
        deviceID,
        bacnet.ObjectAnalogValue(0),
        bacnet.PropertyPresentValue,
    )
    if err != nil {
        log.Printf("Read error: %v", err)
    } else {
        log.Printf("AV:0 Present-Value: %v", value)
    }
}
```

## Reading All Objects from a Device

```go
func readAllObjects(ctx context.Context, client *bacnet.Client, deviceID uint32) {
    // Get object list
    objects, err := client.GetObjectList(ctx, deviceID)
    if err != nil {
        log.Fatalf("Error getting object list: %v", err)
    }

    log.Printf("Device %d has %d objects", deviceID, len(objects))

    // Read present value of each analog input
    for _, obj := range objects {
        if obj.Type == bacnet.TypeAnalogInput {
            value, err := client.ReadProperty(ctx,
                deviceID,
                obj,
                bacnet.PropertyPresentValue,
            )
            if err != nil {
                log.Printf("%s: error %v", obj, err)
            } else {
                log.Printf("%s = %v", obj, value)
            }
        }
    }
}
```

## Error Handling

```go
value, err := client.ReadProperty(ctx, deviceID, object, property)
if err != nil {
    switch {
    case errors.Is(err, bacnet.ErrDeviceNotFound):
        log.Printf("Device %d not found", deviceID)
    case errors.Is(err, bacnet.ErrObjectNotFound):
        log.Printf("Object %s not found", object)
    case errors.Is(err, bacnet.ErrTimeout):
        log.Printf("Request timed out")
    default:
        log.Printf("Error: %v", err)
    }
}
```
