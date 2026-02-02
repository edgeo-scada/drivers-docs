# BACnet Client Library

Pure Go BACnet/IP client library for building automation and control systems.

## Overview

This library provides a complete implementation of the BACnet/IP protocol for Go, designed for building automation applications requiring communication with HVAC controllers, lighting systems, and other BACnet-enabled devices.

## Features

### BACnet/IP Protocol
- Full BACnet/IP with BVLC (BACnet Virtual Link Control)
- UDP transport on port 47808
- BBMD (BACnet Broadcast Management Device) support
- Automatic device discovery

### Object Types
- Analog Input (AI), Analog Output (AO), Analog Value (AV)
- Binary Input (BI), Binary Output (BO), Binary Value (BV)
- Multi-State Input (MSI), Multi-State Output (MSO)
- Device, Calendar, Schedule, Trend Log
- Notification Class, Program

### Property Operations
- ReadProperty / WriteProperty
- ReadPropertyMultiple
- COV (Change of Value) subscriptions
- Priority array support (1-16)

### Advanced Features
- Automatic device discovery with WhoIs
- COV subscriptions for real-time updates
- Built-in metrics
- Comprehensive error handling

## Installation

```bash
go get github.com/edgeo/drivers/bacnet
```

## Quick Example

```go
package main

import (
    "context"
    "log"

    "github.com/edgeo/drivers/bacnet/bacnet"
)

func main() {
    // Create the client
    client := bacnet.NewClient(
        bacnet.WithTimeout(3*time.Second),
        bacnet.WithAutoDiscover(true),
    )

    // Connect
    if err := client.Connect(context.Background()); err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    // Discover devices
    devices, err := client.WhoIs(context.Background())
    if err != nil {
        log.Fatal(err)
    }

    for _, device := range devices {
        log.Printf("Found device: %d at %s", device.InstanceID, device.Address)
    }

    // Read a present value
    value, err := client.ReadProperty(context.Background(),
        1234,                      // Device instance
        bacnet.ObjectAnalogInput(0), // AI:0
        bacnet.PropertyPresentValue,
    )
    if err != nil {
        log.Fatal(err)
    }
    log.Printf("Temperature: %v", value)
}
```

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](getting-started.md) | Quick start guide |
| [Client](client.md) | BACnet client API |
| [Options](options.md) | Configuration and options |
| [Errors](errors.md) | Error handling |
| [Metrics](metrics.md) | Metrics and monitoring |
| [CLI](cli.md) | edgeo-bacnet command-line tool |
| [Changelog](changelog.md) | Version history |

## Examples

| Example | Description |
|---------|-------------|
| [Basic Client](examples/basic-client.md) | Device discovery and property reading |
| [COV Subscription](examples/cov.md) | Change of Value subscriptions |

## Architecture

```
bacnet/
├── client.go      # Main BACnet client
├── types.go       # Object types and constants
├── protocol.go    # BVLC, NPDU, APDU encoding
├── options.go     # Configuration options
├── metrics.go     # Metrics
└── errors.go      # Error handling
```

## BACnet Object Reference

### Object Types

| Type | Abbreviation | Description |
|------|--------------|-------------|
| Analog Input | AI | Sensor values (temperature, pressure) |
| Analog Output | AO | Control outputs (valve position) |
| Analog Value | AV | Setpoints, parameters |
| Binary Input | BI | On/off status |
| Binary Output | BO | On/off control |
| Binary Value | BV | Binary parameters |
| Multi-State Input | MSI | Enumerated status |
| Multi-State Output | MSO | Enumerated control |
| Device | DEV | Device information |

### Common Properties

| Property | Description |
|----------|-------------|
| Present-Value | Current value |
| Object-Name | Human-readable name |
| Description | Object description |
| Status-Flags | In-Alarm, Fault, Overridden, Out-of-Service |
| Units | Engineering units |
| Priority-Array | 16-level priority array |

## Compatibility

- Go 1.22+
- BACnet/IP
- Tested with Tridium, Honeywell, Johnson Controls, Siemens

## License

MIT License
