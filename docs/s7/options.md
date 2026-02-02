# Configuration Options

Complete reference for S7 client configuration options.

## Connection Options

### WithRack

Sets the PLC rack number.

```go
s7.WithRack(0) // Rack 0 (default: 0)
```

**Valid range:** 0-7

### WithSlot

Sets the PLC slot number.

```go
s7.WithSlot(1) // Slot 1 (varies by PLC model)
```

**Default values by PLC:**

| PLC Model | Default Slot |
|-----------|--------------|
| S7-200/Smart | 0 |
| S7-300/400 | 2 |
| S7-1200/1500 | 1 |
| LOGO! | 0 |

### WithTimeout

Sets the request timeout.

```go
s7.WithTimeout(5*time.Second) // 5 seconds (default: 5s)
```

### WithPDUSize

Sets the maximum PDU (Protocol Data Unit) size.

```go
s7.WithPDUSize(960) // 960 bytes (default: 960)
```

**Valid range:** 256-65536 bytes

Larger PDU sizes allow more data per request but may not be supported by all PLCs.

## Reconnection Options

### WithAutoReconnect

Enables automatic reconnection when the connection is lost.

```go
s7.WithAutoReconnect(true) // Enable auto-reconnect (default: false)
```

### WithReconnectBackoff

Sets the initial backoff delay for reconnection attempts.

```go
s7.WithReconnectBackoff(1*time.Second) // 1 second (default: 1s)
```

### WithMaxReconnectTime

Sets the maximum backoff delay for reconnection attempts.

```go
s7.WithMaxReconnectTime(30*time.Second) // 30 seconds (default: 30s)
```

Backoff increases exponentially up to this maximum.

### WithMaxRetries

Sets the maximum number of retry attempts for failed operations.

```go
s7.WithMaxRetries(3) // 3 retries (default: 3)
```

## Logging Options

### WithLogger

Sets a custom logger for the client.

```go
import "log/slog"

logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
s7.WithLogger(logger)
```

## Complete Example

```go
package main

import (
    "context"
    "log/slog"
    "os"
    "time"

    "github.com/edgeo/drivers/s7/s7"
)

func main() {
    logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
        Level: slog.LevelDebug,
    }))

    client := s7.NewClient(
        "192.168.1.10",
        // Connection settings
        s7.WithRack(0),
        s7.WithSlot(1),
        s7.WithTimeout(5*time.Second),
        s7.WithPDUSize(960),

        // Reconnection settings
        s7.WithAutoReconnect(true),
        s7.WithReconnectBackoff(1*time.Second),
        s7.WithMaxReconnectTime(30*time.Second),
        s7.WithMaxRetries(5),

        // Logging
        s7.WithLogger(logger),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Close()
}
```

## Environment Variables

Options can also be set via environment variables with the `S7_` prefix:

| Variable | Description |
|----------|-------------|
| `S7_RACK` | Rack number |
| `S7_SLOT` | Slot number |
| `S7_TIMEOUT` | Request timeout |
| `S7_PDU_SIZE` | PDU size |
| `S7_AUTO_RECONNECT` | Enable auto-reconnect |

## Configuration File

The CLI tool supports YAML configuration in `~/.edgeo-s7.yaml`:

```yaml
# Connection
host: 192.168.1.10
rack: 0
slot: 1
timeout: 5s
pdu-size: 960

# Reconnection
auto-reconnect: true
reconnect-backoff: 1s
max-reconnect-time: 30s
max-retries: 3

# Output
output: table
verbose: false
```

## Options Summary

| Option | Default | Description |
|--------|---------|-------------|
| `WithRack` | 0 | PLC rack number (0-7) |
| `WithSlot` | 1 | PLC slot number |
| `WithTimeout` | 5s | Request timeout |
| `WithPDUSize` | 960 | Max PDU size (256-65536) |
| `WithAutoReconnect` | false | Enable auto-reconnection |
| `WithReconnectBackoff` | 1s | Initial reconnect delay |
| `WithMaxReconnectTime` | 30s | Max reconnect delay |
| `WithMaxRetries` | 3 | Max operation retries |
| `WithLogger` | nil | Custom slog logger |
