---
slug: /
---

# S7 Protocol Driver

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./changelog)
[![Go](https://img.shields.io/badge/go-1.21+-00ADD8.svg)](https://go.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/edgeo-scada/s7/blob/main/LICENSE)

A complete Go implementation of the Siemens S7 protocol (S7comm), with client, connection pool, and CLI tool.

## Installation

```bash
go get github.com/edgeo-scada/s7/s7@v1.0.0
```

To verify the installed version:

```go
import "github.com/edgeo-scada/s7/s7"

func main() {
    fmt.Printf("S7 driver version: %s\n", s7.Version)
    // Output: S7 driver version: 1.0.0
}
```

## Features

- **S7comm TCP client** with automatic reconnection
- **Connection pool** with health checks
- **Read/write** for all memory areas (DB, I, Q, M, T, C)
- **Data types**: Byte, Int, DInt, Real, LReal, String, Bool
- **Built-in metrics** (latency, counters, histograms)
- **Structured logging** via `slog`
- **Complete CLI tool** for interacting with PLCs

## Supported PLCs

| Model | Rack | Slot |
|-------|------|------|
| S7-200 | 0 | 1 |
| S7-200 Smart | 0 | 1 |
| S7-300 | 0 | 1-2 |
| S7-400 | 0 | 1-2 |
| S7-1200 | 0 | 0-1 |
| S7-1500 | 0 | 0-1 |
| LOGO! | 0 | 1 |

## Memory Areas

| Area | Code | Description | S7 Notation |
|------|------|-------------|-------------|
| DB | 0x84 | Data blocks | DBx.DBBn, DBx.DBWn, DBx.DBDn |
| I (PE) | 0x81 | Process inputs | IBn, IWn, IDn |
| Q (PA) | 0x82 | Process outputs | QBn, QWn, QDn |
| M (MK) | 0x83 | Markers/Flags | MBn, MWn, MDn |
| T (TM) | 0x1D | Timers | Tn |
| C (CT) | 0x1C | Counters | Cn |

## Quick Example

```go
package main

import (
    "context"
    "fmt"
    "time"

    "github.com/edgeo-scada/s7/s7"
)

func main() {
    // Create a client
    client, err := s7.NewClient("192.168.1.100:102",
        s7.WithRack(0),
        s7.WithSlot(1),
        s7.WithTimeout(5*time.Second),
    )
    if err != nil {
        panic(err)
    }
    defer client.Close()

    // Connect
    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        panic(err)
    }

    // Read data from DB1
    data, err := client.ReadDB(ctx, 1, 0, 10)
    if err != nil {
        panic(err)
    }
    fmt.Printf("Data: %v\n", data)

    // Read a typed value (REAL)
    realVal, err := client.ReadFloat32(ctx, s7.AreaDB, 1, 100)
    if err != nil {
        panic(err)
    }
    fmt.Printf("Temperature: %.2f\n", realVal)
}
```

## Package Structure

```
s7/
├── client.go      # S7 TCP client
├── pool.go        # Connection pool
├── options.go     # Functional configuration
├── types.go       # Types and constants
├── errors.go      # Error handling
├── metrics.go     # Metrics and observability
├── protocol.go    # Protocol encoding/decoding
└── version.go     # Version information
```

## Next Steps

- [Getting Started](./getting-started)
- [Client Documentation](./client)
- [Connection Pool](./pool)
- [Configuration](./options)
- [Error Handling](./errors)
- [Metrics](./metrics)
- [Changelog](./changelog)
/pool)
- [Configuration](./options)
- [Gestion des erreurs](./errors)
- [Metriques](./metrics)
- [Changelog](./changelog)
