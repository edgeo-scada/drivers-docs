# Configuration Options

Complete reference for BACnet client configuration options.

## Connection Options

### WithDeviceID

Sets the local device ID for this client.

```go
bacnet.WithDeviceID(999999) // Default: 0xFFFFFFFF (broadcast)
```

### WithLocalAddress

Sets the local address to bind to.

```go
bacnet.WithLocalAddress("192.168.1.100") // Auto-detected by default
```

### WithNetworkNumber

Sets the BACnet network number.

```go
bacnet.WithNetworkNumber(1) // Default: 0
```

## BBMD Options

### WithBBMD

Configures BBMD (BACnet Broadcast Management Device) for cross-subnet communication.

```go
bacnet.WithBBMD("192.168.1.1", 47808, 300) // Address, port, TTL in seconds
```

When configured, the client registers as a Foreign Device with the BBMD, allowing communication across subnets.

## Timeout Options

### WithTimeout

Sets the request timeout.

```go
bacnet.WithTimeout(3*time.Second) // Default: 3s
```

### WithRetries

Sets the number of retry attempts.

```go
bacnet.WithRetries(3) // Default: 3
```

### WithRetryDelay

Sets the delay between retries.

```go
bacnet.WithRetryDelay(500*time.Millisecond) // Default: 500ms
```

## APDU Options

### WithMaxAPDULength

Sets the maximum APDU (Application Protocol Data Unit) length.

```go
bacnet.WithMaxAPDULength(1476) // Default: 1476 bytes
```

### WithSegmentation

Sets the segmentation capability.

```go
bacnet.WithSegmentation(bacnet.SegmentationBoth) // Default: None
```

**Values:**
- `SegmentationNone` - No segmentation
- `SegmentationTransmit` - Transmit only
- `SegmentationReceive` - Receive only
- `SegmentationBoth` - Both directions

### WithProposedWindowSize

Sets the segmentation window size.

```go
bacnet.WithProposedWindowSize(4) // Default: 1
```

## Discovery Options

### WithAutoDiscover

Enables automatic device discovery on connect.

```go
bacnet.WithAutoDiscover(true) // Default: false
```

### WithDiscoverTimeout

Sets the timeout for device discovery.

```go
bacnet.WithDiscoverTimeout(5*time.Second) // Default: 5s
```

## Logging Options

### WithLogger

Sets a custom logger.

```go
import "log/slog"

logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
bacnet.WithLogger(logger)
```

## Complete Example

```go
package main

import (
    "context"
    "log/slog"
    "os"
    "time"

    "github.com/edgeo/drivers/bacnet/bacnet"
)

func main() {
    logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
        Level: slog.LevelDebug,
    }))

    client := bacnet.NewClient(
        // Connection
        bacnet.WithDeviceID(999999),
        bacnet.WithLocalAddress("192.168.1.100"),
        bacnet.WithNetworkNumber(0),

        // BBMD for cross-subnet
        bacnet.WithBBMD("192.168.1.1", 47808, 300),

        // Timeouts
        bacnet.WithTimeout(3*time.Second),
        bacnet.WithRetries(3),
        bacnet.WithRetryDelay(500*time.Millisecond),

        // APDU
        bacnet.WithMaxAPDULength(1476),
        bacnet.WithSegmentation(bacnet.SegmentationBoth),
        bacnet.WithProposedWindowSize(4),

        // Discovery
        bacnet.WithAutoDiscover(true),
        bacnet.WithDiscoverTimeout(5*time.Second),

        // Logging
        bacnet.WithLogger(logger),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Close()
}
```

## Read/Write Options

### WithArrayIndex

Reads a specific array element.

```go
value, err := client.ReadProperty(ctx, deviceID, object, property,
    bacnet.WithArrayIndex(8),
)
```

### WithPriority

Sets write priority (1-16).

```go
err := client.WriteProperty(ctx, deviceID, object, property, value,
    bacnet.WithPriority(8), // Manual Operator
)
```

### WithWriteArrayIndex

Writes to a specific array element.

```go
err := client.WriteProperty(ctx, deviceID, object, property, value,
    bacnet.WithWriteArrayIndex(8),
)
```

## COV Options

### WithSubscriptionLifetime

Sets subscription duration in seconds.

```go
client.SubscribeCOV(ctx, deviceID, object, handler,
    bacnet.WithSubscriptionLifetime(300), // 5 minutes
)
```

### WithCOVIncrement

Sets minimum change to trigger notification (analog objects).

```go
client.SubscribeCOV(ctx, deviceID, object, handler,
    bacnet.WithCOVIncrement(0.5), // Trigger on 0.5 change
)
```

### WithConfirmedNotifications

Requests confirmed COV notifications.

```go
client.SubscribeCOV(ctx, deviceID, object, handler,
    bacnet.WithConfirmedNotifications(true),
)
```

## Environment Variables

Options can be set via environment variables with the `BACNET_` prefix:

| Variable | Description |
|----------|-------------|
| `BACNET_DEVICE_ID` | Local device ID |
| `BACNET_LOCAL_ADDRESS` | Local bind address |
| `BACNET_TIMEOUT` | Request timeout |
| `BACNET_RETRIES` | Number of retries |

## Configuration File

The CLI tool supports YAML configuration in `~/.edgeo-bacnet.yaml`:

```yaml
# Connection
device-id: 999999
local: 192.168.1.100
network: 0

# BBMD
bbmd: 192.168.1.1:47808
bbmd-ttl: 300

# Timeouts
timeout: 3s
retries: 3
retry-delay: 500ms

# APDU
max-apdu: 1476
segmentation: both
window-size: 4

# Discovery
auto-discover: true
discover-timeout: 5s

# Output
output: table
verbose: false
```

## Options Summary

| Option | Default | Description |
|--------|---------|-------------|
| `WithDeviceID` | 0xFFFFFFFF | Local device ID |
| `WithLocalAddress` | auto | Local bind address |
| `WithNetworkNumber` | 0 | BACnet network number |
| `WithBBMD` | - | BBMD configuration |
| `WithTimeout` | 3s | Request timeout |
| `WithRetries` | 3 | Retry attempts |
| `WithRetryDelay` | 500ms | Delay between retries |
| `WithMaxAPDULength` | 1476 | Max APDU size |
| `WithSegmentation` | None | Segmentation capability |
| `WithProposedWindowSize` | 1 | Segmentation window |
| `WithAutoDiscover` | false | Auto discovery on connect |
| `WithDiscoverTimeout` | 5s | Discovery timeout |
| `WithLogger` | nil | Custom logger |
