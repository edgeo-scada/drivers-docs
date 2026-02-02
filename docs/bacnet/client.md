# Client API

Complete documentation of the BACnet client API.

## Client Creation

### NewClient

Creates a new BACnet client instance.

```go
func NewClient(opts ...Option) *Client
```

**Example:**

```go
client := bacnet.NewClient(
    bacnet.WithTimeout(3*time.Second),
    bacnet.WithRetries(3),
    bacnet.WithAutoDiscover(true),
)
```

## Connection Methods

### Connect

Binds to a local UDP port and prepares for communication.

```go
func (c *Client) Connect(ctx context.Context) error
```

**Example:**

```go
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

if err := client.Connect(ctx); err != nil {
    log.Fatalf("Connection failed: %v", err)
}
```

### Close

Closes the client and releases resources.

```go
func (c *Client) Close() error
```

### State

Returns the current connection state.

```go
func (c *Client) State() ConnectionState
```

**States:**
- `StateDisconnected`
- `StateConnecting`
- `StateConnected`

## Device Discovery

### WhoIs

Broadcasts a WhoIs request to discover BACnet devices.

```go
func (c *Client) WhoIs(ctx context.Context, opts ...WhoIsOption) ([]*Device, error)
```

**Options:**
- `WithDeviceIDRange(low, high)` - Filter by device instance range
- `WithDiscoverTimeout(duration)` - Override discovery timeout

**Example:**

```go
// Discover all devices
devices, err := client.WhoIs(ctx)

// Discover devices in range 1000-2000
devices, err := client.WhoIs(ctx,
    bacnet.WithDeviceIDRange(1000, 2000),
)

// Discover with longer timeout
devices, err := client.WhoIs(ctx,
    bacnet.WithDiscoverTimeout(10*time.Second),
)
```

### GetDevice

Returns a cached device by instance ID.

```go
func (c *Client) GetDevice(deviceID uint32) *Device
```

### GetObjectList

Retrieves the list of objects on a device.

```go
func (c *Client) GetObjectList(ctx context.Context, deviceID uint32) ([]ObjectIdentifier, error)
```

**Example:**

```go
objects, err := client.GetObjectList(ctx, 1234)
if err != nil {
    log.Fatal(err)
}

for _, obj := range objects {
    log.Printf("Object: %s", obj)
}
```

## Property Operations

### ReadProperty

Reads a single property from an object.

```go
func (c *Client) ReadProperty(ctx context.Context, deviceID uint32, object ObjectIdentifier, property PropertyIdentifier, opts ...ReadOption) (interface{}, error)
```

**Parameters:**
- `deviceID` - Target device instance ID
- `object` - Object identifier (e.g., AI:0)
- `property` - Property to read
- `opts` - Optional read options

**Options:**
- `WithArrayIndex(index)` - Read specific array element

**Example:**

```go
// Read present value
value, err := client.ReadProperty(ctx,
    1234,
    bacnet.ObjectAnalogInput(0),
    bacnet.PropertyPresentValue,
)

// Read array element
value, err := client.ReadProperty(ctx,
    1234,
    bacnet.ObjectAnalogOutput(0),
    bacnet.PropertyPriorityArray,
    bacnet.WithArrayIndex(8),
)
```

### ReadPropertyMultiple

Reads multiple properties in a single request.

```go
func (c *Client) ReadPropertyMultiple(ctx context.Context, deviceID uint32, requests []ReadRequest) ([]ReadResult, error)
```

**ReadRequest structure:**

```go
type ReadRequest struct {
    Object     ObjectIdentifier
    Property   PropertyIdentifier
    ArrayIndex *uint32 // Optional
}
```

**Example:**

```go
requests := []bacnet.ReadRequest{
    {Object: bacnet.ObjectAnalogInput(0), Property: bacnet.PropertyPresentValue},
    {Object: bacnet.ObjectAnalogInput(0), Property: bacnet.PropertyObjectName},
    {Object: bacnet.ObjectAnalogInput(0), Property: bacnet.PropertyUnits},
    {Object: bacnet.ObjectAnalogInput(1), Property: bacnet.PropertyPresentValue},
}

results, err := client.ReadPropertyMultiple(ctx, 1234, requests)
if err != nil {
    log.Fatal(err)
}

for _, r := range results {
    if r.Error != nil {
        log.Printf("%s.%s: error %v", r.Object, r.Property, r.Error)
    } else {
        log.Printf("%s.%s = %v", r.Object, r.Property, r.Value)
    }
}
```

### WriteProperty

Writes a value to an object property.

```go
func (c *Client) WriteProperty(ctx context.Context, deviceID uint32, object ObjectIdentifier, property PropertyIdentifier, value interface{}, opts ...WriteOption) error
```

**Options:**
- `WithPriority(priority)` - Write priority (1-16)
- `WithWriteArrayIndex(index)` - Write to array element

**Example:**

```go
// Simple write
err := client.WriteProperty(ctx,
    1234,
    bacnet.ObjectAnalogOutput(0),
    bacnet.PropertyPresentValue,
    72.5,
)

// Write with priority
err := client.WriteProperty(ctx,
    1234,
    bacnet.ObjectAnalogOutput(0),
    bacnet.PropertyPresentValue,
    72.5,
    bacnet.WithPriority(8), // Manual Operator
)

// Relinquish (write null at priority)
err := client.WriteProperty(ctx,
    1234,
    bacnet.ObjectAnalogOutput(0),
    bacnet.PropertyPresentValue,
    nil, // null value
    bacnet.WithPriority(8),
)
```

## COV Subscriptions

### SubscribeCOV

Subscribes to Change of Value notifications.

```go
func (c *Client) SubscribeCOV(ctx context.Context, deviceID uint32, object ObjectIdentifier, handler COVHandler, opts ...COVOption) (uint32, error)
```

**COVHandler signature:**

```go
type COVHandler func(notification *COVNotification)

type COVNotification struct {
    DeviceID   uint32
    Object     ObjectIdentifier
    Property   PropertyIdentifier
    Value      interface{}
    StatusFlags StatusFlags
    Timestamp  time.Time
}
```

**Options:**
- `WithSubscriptionLifetime(seconds)` - Subscription duration
- `WithCOVIncrement(increment)` - Minimum change to trigger (analog only)
- `WithConfirmedNotifications(bool)` - Use confirmed notifications

**Example:**

```go
handler := func(n *bacnet.COVNotification) {
    log.Printf("COV: Device %d, %s = %v",
        n.DeviceID, n.Object, n.Value)
}

// Subscribe for 5 minutes
subID, err := client.SubscribeCOV(ctx,
    1234,
    bacnet.ObjectAnalogInput(0),
    handler,
    bacnet.WithSubscriptionLifetime(300),
    bacnet.WithCOVIncrement(0.5), // Trigger on 0.5 change
)
if err != nil {
    log.Fatal(err)
}

log.Printf("Subscription ID: %d", subID)
```

### UnsubscribeCOV

Cancels a COV subscription.

```go
func (c *Client) UnsubscribeCOV(ctx context.Context, deviceID uint32, object ObjectIdentifier, subscriptionID uint32) error
```

## Object Identifiers

Helper functions to create object identifiers:

```go
// Analog types
bacnet.ObjectAnalogInput(instance uint32)    // AI
bacnet.ObjectAnalogOutput(instance uint32)   // AO
bacnet.ObjectAnalogValue(instance uint32)    // AV

// Binary types
bacnet.ObjectBinaryInput(instance uint32)    // BI
bacnet.ObjectBinaryOutput(instance uint32)   // BO
bacnet.ObjectBinaryValue(instance uint32)    // BV

// Multi-state types
bacnet.ObjectMultiStateInput(instance uint32)   // MSI
bacnet.ObjectMultiStateOutput(instance uint32)  // MSO
bacnet.ObjectMultiStateValue(instance uint32)   // MSV

// Other types
bacnet.ObjectDevice(instance uint32)      // DEV
bacnet.ObjectCalendar(instance uint32)    // CAL
bacnet.ObjectSchedule(instance uint32)    // SCH
bacnet.ObjectTrendLog(instance uint32)    // TL
bacnet.ObjectNotificationClass(instance uint32) // NC
```

## Property Identifiers

Common property identifiers:

```go
const (
    PropertyObjectIdentifier  PropertyIdentifier = 75
    PropertyObjectName        PropertyIdentifier = 77
    PropertyObjectType        PropertyIdentifier = 79
    PropertyPresentValue      PropertyIdentifier = 85
    PropertyDescription       PropertyIdentifier = 28
    PropertyStatusFlags       PropertyIdentifier = 111
    PropertyUnits             PropertyIdentifier = 117
    PropertyPriorityArray     PropertyIdentifier = 87
    PropertyRelinquishDefault PropertyIdentifier = 104
    PropertyCOVIncrement      PropertyIdentifier = 22
    PropertyHighLimit         PropertyIdentifier = 45
    PropertyLowLimit          PropertyIdentifier = 59
)
```

## Metrics

### Metrics

Returns client metrics.

```go
func (c *Client) Metrics() *Metrics
```

**Example:**

```go
metrics := client.Metrics()
snapshot := metrics.Snapshot()

log.Printf("Requests: %d", snapshot.RequestsSent)
log.Printf("Devices discovered: %d", snapshot.DevicesDiscovered)
log.Printf("Avg latency: %v", snapshot.AvgLatency)
```

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
    client := bacnet.NewClient(
        bacnet.WithTimeout(3*time.Second),
        bacnet.WithRetries(3),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    // Discover devices
    devices, err := client.WhoIs(ctx)
    if err != nil {
        log.Fatal(err)
    }

    for _, device := range devices {
        log.Printf("\nDevice %d: %s", device.InstanceID, device.ObjectName)

        // Get object list
        objects, err := client.GetObjectList(ctx, device.InstanceID)
        if err != nil {
            log.Printf("  Error getting objects: %v", err)
            continue
        }

        // Read present value of first 5 analog inputs
        count := 0
        for _, obj := range objects {
            if obj.Type == bacnet.TypeAnalogInput && count < 5 {
                value, err := client.ReadProperty(ctx,
                    device.InstanceID,
                    obj,
                    bacnet.PropertyPresentValue,
                )
                if err != nil {
                    log.Printf("  %s: error %v", obj, err)
                } else {
                    log.Printf("  %s = %v", obj, value)
                }
                count++
            }
        }
    }
}
```
