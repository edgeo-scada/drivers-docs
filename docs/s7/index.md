---
sidebar_position: 1
slug: /s7/
---

# S7 Client Library

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./changelog)
[![Go](https://img.shields.io/badge/go-1.21+-00ADD8.svg)](https://go.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/edgeo-scada/s7/blob/main/LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-edgeo--scada%2Fs7-181717?logo=github)](https://github.com/edgeo-scada/s7)

Pure Go implementation of the Siemens S7 communication protocol (S7comm) for industrial PLCs.

## Installation

```bash
go get github.com/edgeo-scada/s7@v1.0.0
```

To verify the installed version:

```go
import "github.com/edgeo-scada/s7"

func main() {
    fmt.Printf("S7 driver version: %s\n", s7.Version)
    // Output: S7 driver version: 1.0.0
}
```

## Supported PLCs

- **S7-200** - Compact PLCs
- **S7-200 Smart** - Enhanced compact PLCs
- **S7-300** - Modular PLCs
- **S7-400** - High-end modular PLCs
- **S7-1200** - Compact controller
- **S7-1500** - Advanced controller
- **LOGO!** - Logic modules

## Features

### Protocol Support
- Full S7comm protocol implementation
- COTP (Connection Oriented Transport Protocol)
- TCP/IP transport on port 102
- Automatic PDU negotiation

### Memory Areas
- **DB** - Data Blocks (DBx.DBBn, DBx.DBWn, DBx.DBDn)
- **I** - Process Inputs (IBn, IWn, IDn)
- **Q** - Process Outputs (QBn, QWn, QDn)
- **M** - Markers/Flags (MBn, MWn, MDn)
- **T** - Timers (Tn)
- **C** - Counters (Cn)

### Data Types
- Byte, Int (16-bit signed), UInt (16-bit unsigned)
- DInt (32-bit signed), UDInt (32-bit unsigned)
- Real (32-bit float), LReal (64-bit float)
- Bool, String (variable length)

### Advanced Features
- Connection pooling for high-throughput applications
- Automatic reconnection with exponential backoff
- Multi-item read/write operations
- Built-in metrics and performance tracking

## Quick Example

```go
package main

import (
    "context"
    "log"

    "github.com/edgeo-scada/s7"
)

func main() {
    // Create the client
    client := s7.NewClient(
        "192.168.1.10",
        s7.WithRack(0),
        s7.WithSlot(1),
    )

    // Connect
    if err := client.Connect(context.Background()); err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    // Read from Data Block
    data, err := client.ReadDB(context.Background(), 1, 0, 10) // DB1.DBB0, 10 bytes
    if err != nil {
        log.Fatal(err)
    }
    log.Printf("Data: %v", data)

    // Read a float value
    value, err := client.ReadFloat32(context.Background(), s7.AreaDB, 1, 100) // DB1.DBD100
    if err != nil {
        log.Fatal(err)
    }
    log.Printf("Temperature: %.2f", value)
}
```

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](getting-started.md) | Quick start guide |
| [Client](client.md) | S7 client API |
| [Options](options.md) | Configuration and options |
| [Pool](pool.md) | Connection pooling |
| [Errors](errors.md) | Error handling |
| [Metrics](metrics.md) | Metrics and monitoring |
| [CLI](cli.md) | edgeo-s7 command-line tool |
| [Changelog](changelog.md) | Version history |

## Examples

| Example | Description |
|---------|-------------|
| [Basic Client](examples/basic-client.md) | Read and write operations |
| [Connection Pool](examples/pool.md) | High-throughput applications |

## Architecture

```
s7/
├── client.go      # Main S7 client
├── types.go       # Memory areas and constants
├── protocol.go    # S7comm encoding/decoding
├── options.go     # Configuration options
├── pool.go        # Connection pooling
├── metrics.go     # Metrics
└── errors.go      # Error handling
```

## Compatibility

- All S7 PLC series
- TCP/IP connectivity
