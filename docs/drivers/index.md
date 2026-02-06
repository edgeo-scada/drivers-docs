---
slug: /drivers
sidebar_position: 5
---

# Drivers

Edgeo provides a suite of industrial communication drivers, each implemented as an independent Go module. Drivers can be used standalone in your own applications or as part of the full Edgeo SCADA platform.

## Available Drivers

| Protocol | Package | Description |
|----------|---------|-------------|
| [Modbus TCP](/modbus/) | `github.com/edgeo-scada/modbus` | Industrial standard for PLC communication (FC01-FC17) |
| [OPC UA](/opcua/) | `github.com/edgeo-scada/opcua` | Unified Architecture with sessions, subscriptions, and security |
| [MQTT](/mqtt/) | `github.com/edgeo-scada/mqtt` | MQTT 5.0 client with TLS, WebSocket, and connection pooling |
| [S7](/s7/) | `github.com/edgeo-scada/s7` | Siemens S7comm for S7-200/300/400/1200/1500/LOGO! |
| [BACnet](/bacnet/) | `github.com/edgeo-scada/bacnet` | BACnet/IP for building automation with COV and discovery |
| [SNMP](/snmp/) | `github.com/edgeo-scada/snmp` | SNMP v1/v2c/v3 with trap listener and MIB walk |

## Common Features

All drivers share a consistent design:

- **Connection pooling** — Manage multiple connections efficiently
- **Automatic reconnection** — Configurable retry with exponential backoff
- **Built-in metrics** — Prometheus-compatible connection and operation metrics
- **Context support** — Full `context.Context` integration for timeouts and cancellation
- **CLI tools** — Standalone command-line tools for testing and debugging

## Using Drivers Standalone

Each driver can be installed independently:

```bash
go get github.com/edgeo-scada/modbus
go get github.com/edgeo-scada/opcua
go get github.com/edgeo-scada/mqtt
go get github.com/edgeo-scada/s7
go get github.com/edgeo-scada/bacnet
go get github.com/edgeo-scada/snmp
```

See each driver's documentation for detailed API reference and examples.
