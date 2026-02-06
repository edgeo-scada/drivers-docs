---
slug: /devices
sidebar_position: 6
---

# Devices

Devices represent connections to industrial equipment via protocol drivers. Each device has a protocol, connection configuration, and optional polling settings.

## Device Lifecycle

```
  Created → Connecting → Connected ⇄ Reconnecting
                ↓                         ↓
              Error                  Disconnected
```

**Statuses:** `disconnected`, `connecting`, `connected`, `reconnecting`, `error`

## Creating a Device

Create a device via the API or web UI. Each device specifies a protocol and protocol-specific configuration.

```json
POST /api/devices
{
  "name": "PLC Line 1",
  "description": "Main production PLC",
  "protocol": "modbus-tcp",
  "config": {
    "host": "192.168.1.100",
    "port": 502,
    "slave_id": 1,
    "timeout": 5000,
    "byte_order": "big",
    "word_order": "high_low"
  },
  "enabled": true,
  "polling_enabled": true,
  "polling_interval": 1000
}
```

## Protocol Configuration

Each protocol defines its own configuration schema. Use `GET /api/protocols` to discover available protocols and their configuration fields.

### Modbus TCP

```json
{
  "host": "192.168.1.100",
  "port": 502,
  "slave_id": 1,
  "timeout": 5000,
  "byte_order": "big",
  "word_order": "high_low"
}
```

### OPC UA

```json
{
  "endpoint": "opc.tcp://192.168.1.100:4840",
  "security_policy": "None",
  "security_mode": "None",
  "username": "",
  "password": ""
}
```

### S7

```json
{
  "host": "192.168.1.100",
  "port": 102,
  "rack": 0,
  "slot": 1,
  "timeout": 5000
}
```

### MQTT

```json
{
  "broker": "tcp://192.168.1.100:1883",
  "client_id": "edgeo-01",
  "username": "",
  "password": "",
  "use_tls": false
}
```

### BACnet

```json
{
  "address": "192.168.1.100",
  "port": 47808,
  "timeout": 5000
}
```

### SNMP

```json
{
  "host": "192.168.1.100",
  "port": 161,
  "version": "v2c",
  "community": "public",
  "timeout": 5000
}
```

## Tag Mappings

Tag mappings link tags to device addresses, defining how values are read from and written to the device.

```json
POST /api/devices/:id/mappings
{
  "tag_id": "<tag-uuid>",
  "address": "40001",
  "data_type": "uint16",
  "properties": {
    "scale": 0.1,
    "offset": 0
  },
  "read_write": "readwrite",
  "polling_group": "default",
  "enabled": true
}
```

### Address Formats

| Protocol | Example | Description |
|----------|---------|-------------|
| Modbus TCP | `40001` | Holding register 1 |
| OPC UA | `ns=2;s=Temperature` | Node ID |
| S7 | `DB1.DBD0` | Data block address |
| MQTT | `sensors/temp` | Topic |
| BACnet | `analog-input,0` | Object type and instance |
| SNMP | `1.3.6.1.2.1.1.1.0` | OID |

### Data Types

`bool`, `int16`, `uint16`, `int32`, `uint32`, `int64`, `uint64`, `float32`, `float64`, `string`

## Polling

When `polling_enabled` is `true`, the ProtocolService reads all mapped tag addresses at the configured `polling_interval` (in milliseconds) and updates tag values through the TagService.

Polling groups allow different update rates for different sets of tags on the same device.

## Device Operations

| Endpoint | Description |
|----------|-------------|
| `POST /api/devices/:id/connect` | Establish connection |
| `POST /api/devices/:id/disconnect` | Close connection |
| `POST /api/devices/:id/reconnect` | Reconnect |
| `POST /api/devices/:id/read` | Read tags on demand |
| `POST /api/devices/:id/write` | Write a value to the device |
| `POST /api/devices/:id/browse` | Browse device address space (OPC UA, BACnet) |

## Browsing

Protocols that implement the `BrowsableConnection` interface (OPC UA, BACnet) support address space browsing. This lets you explore the device structure and discover available data points.

```json
POST /api/devices/:id/browse
{
  "node_id": "ns=0;i=85"
}
```
