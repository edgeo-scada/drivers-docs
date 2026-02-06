# Configuration

Configuration uses the functional options pattern.

## Client Options

### WithRack

Sets the PLC rack number.

```go
s7.WithRack(rack Rack)
```

```go
client, _ := s7.NewClient("192.168.1.100:102",
    s7.WithRack(0),
)
```

The rack identifies the physical position of the PLC. Values: 0-7.

**Default:** 0

### WithSlot

Sets the PLC slot number.

```go
s7.WithSlot(slot Slot)
```

```go
client, _ := s7.NewClient("192.168.1.100:102",
    s7.WithSlot(1),
)
```

The slot identifies the CPU location within the rack. Values: 0-31.

**Default:** 1 (for S7-300/400)

Typical configuration by model:

| Model | Rack | Slot |
|-------|------|------|
| S7-300/400 | 0 | 1-2 |
| S7-1200/1500 | 0 | 0-1 |
| S7-200 Smart | 0 | 1 |
| LOGO! | 0 | 1 |

### WithTimeout

Sets the timeout for operations.

```go
s7.WithTimeout(d time.Duration)
```

```go
client, _ := s7.NewClient("192.168.1.100:102",
    s7.WithTimeout(5*time.Second),
)
```

**Default:** 5 seconds

### WithPDUSize

Sets the maximum PDU size to negotiate.

```go
s7.WithPDUSize(size uint16)
```

```go
client, _ := s7.NewClient("192.168.1.100:102",
    s7.WithPDUSize(480),
)
```

The actual size will be negotiated with the PLC (may be lower).

| Constant | Value |
|----------|-------|
| `MinPDUSize` | 240 |
| `DefaultPDUSize` | 480 |
| `MaxPDUSize` | 960 |

**Default:** 480

### WithAutoReconnect

Enables automatic reconnection when the connection is lost.

```go
s7.WithAutoReconnect(enable bool)
```

```go
client, _ := s7.NewClient("192.168.1.100:102",
    s7.WithAutoReconnect(true),
)
```

**Default:** false

### WithReconnectBackoff

Sets the initial delay between reconnection attempts.

```go
s7.WithReconnectBackoff(d time.Duration)
```

The backoff increases exponentially up to `MaxReconnectTime`.

**Default:** 1 second

### WithMaxReconnectTime

Sets the maximum delay between reconnection attempts.

```go
s7.WithMaxReconnectTime(d time.Duration)
```

**Default:** 30 seconds

### WithMaxRetries

Sets the maximum number of attempts for a request.

```go
s7.WithMaxRetries(n int)
```

```go
client, _ := s7.NewClient("192.168.1.100:102",
    s7.WithAutoReconnect(true),
    s7.WithMaxRetries(5),
)
```

**Default:** 3

### WithOnConnect

Sets a callback called upon connection.

```go
s7.WithOnConnect(fn func())
```

```go
client, _ := s7.NewClient("192.168.1.100:102",
    s7.WithOnConnect(func() {
        log.Println("Connected!")
    }),
)
```

### WithOnDisconnect

Sets a callback called upon disconnection.

```go
s7.WithOnDisconnect(fn func(error))
```

```go
client, _ := s7.NewClient("192.168.1.100:102",
    s7.WithOnDisconnect(func(err error) {
        log.Printf("Disconnected: %v\n", err)
    }),
)
```

### WithLogger

Sets the logger for the client.

```go
s7.WithLogger(logger *slog.Logger)
```

```go
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelDebug,
}))

client, _ := s7.NewClient("192.168.1.100:102",
    s7.WithLogger(logger),
)
```

**Default:** `slog.Default()`

## Pool Options

### WithSize

Sets the maximum pool size.

```go
s7.WithSize(size int)
```

```go
pool, _ := s7.NewPool("192.168.1.100:102",
    s7.WithSize(20),
)
```

**Default:** 5

### WithMaxIdleTime

Sets the maximum idle time before closing a connection.

```go
s7.WithMaxIdleTime(d time.Duration)
```

```go
pool, _ := s7.NewPool("192.168.1.100:102",
    s7.WithMaxIdleTime(10*time.Minute),
)
```

**Default:** 5 minutes

### WithHealthCheckFrequency

Sets the frequency of connection health checks.

```go
s7.WithHealthCheckFrequency(d time.Duration)
```

```go
pool, _ := s7.NewPool("192.168.1.100:102",
    s7.WithHealthCheckFrequency(30*time.Second),
)
```

**Default:** 1 minute. Set to 0 to disable.

### WithClientOptions

Sets the options used when creating pool clients.

```go
s7.WithClientOptions(opts ...Option)
```

```go
pool, _ := s7.NewPool("192.168.1.100:102",
    s7.WithSize(10),
    s7.WithClientOptions(
        s7.WithRack(0),
        s7.WithSlot(1),
        s7.WithTimeout(3*time.Second),
    ),
)
```

## Complete Example

```go
package main

import (
    "log/slog"
    "os"
    "time"

    "github.com/edgeo-scada/s7/s7"
)

func main() {
    // Custom logger
    logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
        Level: slog.LevelInfo,
    }))

    // Client with all options
    client, _ := s7.NewClient("192.168.1.100:102",
        // PLC identification
        s7.WithRack(0),
        s7.WithSlot(1),

        // PDU
        s7.WithPDUSize(480),

        // Timeouts
        s7.WithTimeout(5*time.Second),

        // Reconnection
        s7.WithAutoReconnect(true),
        s7.WithReconnectBackoff(500*time.Millisecond),
        s7.WithMaxReconnectTime(30*time.Second),
        s7.WithMaxRetries(5),

        // Callbacks
        s7.WithOnConnect(func() {
            logger.Info("connected")
        }),
        s7.WithOnDisconnect(func(err error) {
            logger.Warn("disconnected", slog.String("error", err.Error()))
        }),

        // Logging
        s7.WithLogger(logger),
    )
    defer client.Close()
}
```
