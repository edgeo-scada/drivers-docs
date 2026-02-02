# Getting Started

This guide will help you get started with the S7 client library.

## Installation

```bash
go get github.com/edgeo/drivers/s7
```

## Basic Connection

```go
package main

import (
    "context"
    "log"

    "github.com/edgeo/drivers/s7/s7"
)

func main() {
    // Create client for S7-1200/1500 (rack 0, slot 1)
    client := s7.NewClient(
        "192.168.1.10",
        s7.WithRack(0),
        s7.WithSlot(1),
        s7.WithTimeout(5*time.Second),
    )

    // Connect to the PLC
    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatalf("Connection failed: %v", err)
    }
    defer client.Close()

    log.Println("Connected to S7 PLC")
}
```

## PLC Configuration

Different S7 PLCs require different rack/slot configurations:

| PLC Model | Rack | Slot |
|-----------|------|------|
| S7-200 | 0 | 0 |
| S7-200 Smart | 0 | 0 |
| S7-300 | 0 | 2 |
| S7-400 | 0 | 2 or 3 |
| S7-1200 | 0 | 1 |
| S7-1500 | 0 | 1 |
| LOGO! | 0 | 0 |

## Memory Addressing

S7 PLCs organize memory into areas. Each area uses a specific addressing format:

### Data Blocks (DB)

```go
// Read byte at DB1.DBB0
data, err := client.ReadDB(ctx, 1, 0, 1)

// Read word (2 bytes) at DB1.DBW10
data, err := client.ReadDB(ctx, 1, 10, 2)

// Read double word (4 bytes) at DB1.DBD100
data, err := client.ReadDB(ctx, 1, 100, 4)
```

### Process Inputs (I)

```go
// Read input byte at IB0
data, err := client.ReadInputs(ctx, 0, 1)

// Read input word at IW10
data, err := client.ReadInputs(ctx, 10, 2)
```

### Process Outputs (Q)

```go
// Read output byte at QB0
data, err := client.ReadOutputs(ctx, 0, 1)

// Write to output byte QB0
err := client.WriteOutputs(ctx, 0, []byte{0xFF})
```

### Markers (M)

```go
// Read marker byte at MB0
data, err := client.ReadMarkers(ctx, 0, 1)

// Write to marker word at MW10
err := client.WriteMarkers(ctx, 10, []byte{0x01, 0x02})
```

## Reading Typed Values

The client provides typed read methods for common data types:

```go
// Read boolean (bit)
value, err := client.ReadBool(ctx, s7.AreaDB, 1, 0, 0) // DB1.DBX0.0

// Read 16-bit integer
value, err := client.ReadInt16(ctx, s7.AreaDB, 1, 10) // DB1.DBW10

// Read 32-bit integer
value, err := client.ReadInt32(ctx, s7.AreaDB, 1, 100) // DB1.DBD100

// Read 32-bit float
value, err := client.ReadFloat32(ctx, s7.AreaDB, 1, 200) // DB1.DBD200

// Read 64-bit float
value, err := client.ReadFloat64(ctx, s7.AreaDB, 1, 300) // DB1.DBD300
```

## Writing Typed Values

```go
// Write boolean
err := client.WriteBool(ctx, s7.AreaDB, 1, 0, 0, true) // DB1.DBX0.0

// Write 16-bit integer
err := client.WriteInt16(ctx, s7.AreaDB, 1, 10, 1234) // DB1.DBW10

// Write 32-bit float
err := client.WriteFloat32(ctx, s7.AreaDB, 1, 200, 23.5) // DB1.DBD200
```

## Multi-Item Operations

Read or write multiple items in a single request for better performance:

```go
// Define items to read
items := []s7.ReadItem{
    {Area: s7.AreaDB, DBNumber: 1, Start: 0, Length: 10},
    {Area: s7.AreaDB, DBNumber: 1, Start: 100, Length: 4},
    {Area: s7.AreaInputs, Start: 0, Length: 2},
}

// Read all items
results, err := client.ReadMulti(ctx, items)
if err != nil {
    log.Fatal(err)
}

for i, data := range results {
    log.Printf("Item %d: %v", i, data)
}
```

## Error Handling

```go
if err := client.Connect(ctx); err != nil {
    switch {
    case errors.Is(err, s7.ErrConnectionRefused):
        log.Println("PLC refused connection - check IP and port")
    case errors.Is(err, s7.ErrTimeout):
        log.Println("Connection timeout - PLC may be unreachable")
    case errors.Is(err, s7.ErrInvalidRackSlot):
        log.Println("Invalid rack/slot configuration")
    default:
        log.Printf("Connection error: %v", err)
    }
}
```

## Auto-Reconnection

Enable automatic reconnection for reliable communication:

```go
client := s7.NewClient(
    "192.168.1.10",
    s7.WithAutoReconnect(true),
    s7.WithReconnectBackoff(1*time.Second),
    s7.WithMaxReconnectTime(30*time.Second),
    s7.WithMaxRetries(5),
)
```

## Next Steps

- Learn about the [Client API](client.md)
- Configure [Options](options.md)
- Use [Connection Pooling](pool.md) for high-throughput
- Try the [CLI Tool](cli.md)
