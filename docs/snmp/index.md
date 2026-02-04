---
sidebar_position: 1
slug: /snmp/
---

# SNMP Client Library

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./changelog)
[![Go](https://img.shields.io/badge/go-1.22+-00ADD8.svg)](https://go.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/edgeo-scada/snmp/blob/main/LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-edgeo--scada%2Fsnmp-181717?logo=github)](https://github.com/edgeo-scada/snmp)

Complete Go implementation of SNMP v1/v2c/v3 client with trap support for network management.

## Installation

```bash
go get github.com/edgeo-scada/snmp@v1.0.0
```

To verify the installed version:

```go
import "github.com/edgeo-scada/snmp"

func main() {
    fmt.Printf("SNMP driver version: %s\n", snmp.Version)
    // Output: SNMP driver version: 1.0.0
}
```

## Features

### SNMP Versions
- **SNMPv1** - Basic protocol with community-based authentication
- **SNMPv2c** - Enhanced with GetBulk and improved error handling
- **SNMPv3** - Secure protocol with authentication and encryption

### Operations
- **GET** - Retrieve single or multiple OID values
- **GETNEXT** - Retrieve next OID in MIB tree
- **GETBULK** - Efficient bulk retrieval (v2c/v3)
- **SET** - Modify OID values
- **WALK** - Traverse MIB subtrees
- **TRAP** - Receive trap notifications

### SNMPv3 Security
- **Authentication**: MD5, SHA, SHA-224, SHA-256, SHA-384, SHA-512
- **Privacy (Encryption)**: DES, AES, AES-192, AES-256

### Advanced Features
- Connection pooling with load balancing
- Automatic reconnection
- Built-in trap listener
- Comprehensive metrics

## Quick Example

```go
package main

import (
    "context"
    "log"

    "github.com/edgeo-scada/snmp"
)

func main() {
    // Create client for SNMPv2c
    client := snmp.NewClient(
        snmp.WithTarget("192.168.1.1"),
        snmp.WithVersion(snmp.Version2c),
        snmp.WithCommunity("public"),
    )

    // Connect
    if err := client.Connect(context.Background()); err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    // Get system description
    result, err := client.Get(context.Background(), snmp.OIDSysDescr)
    if err != nil {
        log.Fatal(err)
    }

    log.Printf("System: %s", result[0].Value)
}
```

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](getting-started.md) | Quick start guide |
| [Client](client.md) | SNMP client API |
| [Options](options.md) | Configuration and options |
| [Pool](pool.md) | Connection pooling |
| [Trap Listener](trap.md) | Receiving trap notifications |
| [Errors](errors.md) | Error handling |
| [Metrics](metrics.md) | Metrics and monitoring |
| [CLI](cli.md) | edgeo-snmp command-line tool |
| [Changelog](changelog.md) | Version history |

## Examples

| Example | Description |
|---------|-------------|
| [Basic Client](examples/basic-client.md) | GET, SET, and WALK operations |
| [SNMPv3](examples/snmpv3.md) | Secure SNMPv3 with auth/privacy |

## Architecture

```
snmp/
├── client.go      # Main SNMP client
├── types.go       # OID definitions and constants
├── protocol.go    # ASN.1 BER encoding/decoding
├── packets.go     # PDU structures
├── options.go     # Configuration options
├── trap.go        # Trap listener
├── pool.go        # Connection pooling
├── metrics.go     # Metrics
└── errors.go      # Error handling
```

## Common OIDs

| OID | Constant | Description |
|-----|----------|-------------|
| 1.3.6.1.2.1.1.1.0 | `OIDSysDescr` | System description |
| 1.3.6.1.2.1.1.2.0 | `OIDSysObjectID` | System object ID |
| 1.3.6.1.2.1.1.3.0 | `OIDSysUpTime` | System uptime |
| 1.3.6.1.2.1.1.4.0 | `OIDSysContact` | System contact |
| 1.3.6.1.2.1.1.5.0 | `OIDSysName` | System name |
| 1.3.6.1.2.1.1.6.0 | `OIDSysLocation` | System location |

## SNMP Versions Comparison

| Feature | v1 | v2c | v3 |
|---------|----|----|-----|
| GetBulk | No | Yes | Yes |
| 64-bit counters | No | Yes | Yes |
| Authentication | Community | Community | User-based |
| Encryption | No | No | Yes |
| Error handling | Basic | Enhanced | Enhanced |

## Compatibility

- SNMPv1, SNMPv2c, SNMPv3
- Tested with Cisco, HP, Juniper, Linux net-snmp
