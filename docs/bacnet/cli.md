# edgeo-bacnet - BACnet Command Line Interface

A complete command-line tool for interacting with BACnet/IP devices.

## Installation

```bash
go build -o edgeo-bacnet ./cmd/edgeo-bacnet
```

## Commands Overview

| Command | Description |
|---------|-------------|
| `scan` | Discover BACnet devices (WhoIs) |
| `read` | Read property from object |
| `write` | Write property to object |
| `watch` | Monitor property values |
| `dump` | Dump all objects/properties from device |
| `info` | Display device information |
| `interactive` | Interactive REPL shell |
| `version` | Print version information |

## Global Flags

### Connection

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--host` | `-H` | - | Target device IP address |
| `--port` | `-p` | `47808` | BACnet/IP port |
| `--device` | `-d` | - | Target device instance ID |
| `--timeout` | `-t` | `3s` | Request timeout |
| `--retries` | | `3` | Number of retries |

### Network

| Flag | Description |
|------|-------------|
| `--local` | Local address to bind to |
| `--bbmd` | BBMD address for cross-subnet |

### Output

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--output` | `-o` | `table` | Format: table, json, csv, raw |
| `--verbose` | `-v` | `false` | Verbose output |

### Configuration

| Flag | Description |
|------|-------------|
| `--config` | Config file path (default: `~/.edgeo-bacnet.yaml`) |

## Command: scan

Discover BACnet devices on the network.

### Usage

```bash
edgeo-bacnet scan [flags]
```

### Flags

| Flag | Description |
|------|-------------|
| `--timeout` | Discovery timeout (default: 5s) |
| `--low` | Minimum device instance ID |
| `--high` | Maximum device instance ID |

### Examples

```bash
# Discover all devices
edgeo-bacnet scan

# Discover with longer timeout
edgeo-bacnet scan --timeout 10s

# Discover specific range
edgeo-bacnet scan --low 1000 --high 2000

# JSON output
edgeo-bacnet scan -o json
```

## Command: read

Read property from an object.

### Usage

```bash
edgeo-bacnet read [flags]
```

### Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--device` | `-d` | Device instance ID (required) |
| `--object` | | Object identifier (e.g., "ai:0", "ao:1") |
| `--property` | | Property name or ID (default: present-value) |
| `--index` | | Array index |

### Object Identifiers

Format: `type:instance` or `type-instance`

| Type | Abbreviations |
|------|---------------|
| Analog Input | `ai`, `analog-input` |
| Analog Output | `ao`, `analog-output` |
| Analog Value | `av`, `analog-value` |
| Binary Input | `bi`, `binary-input` |
| Binary Output | `bo`, `binary-output` |
| Binary Value | `bv`, `binary-value` |
| Multi-State Input | `msi`, `multi-state-input` |
| Multi-State Output | `mso`, `multi-state-output` |
| Device | `dev`, `device` |

### Property Names

| Name | Abbreviation |
|------|--------------|
| present-value | pv |
| object-name | name |
| object-identifier | oid |
| description | desc |
| status-flags | sf |
| units | - |
| priority-array | pa |
| relinquish-default | rd |

### Examples

```bash
# Read present value of AI:0
edgeo-bacnet read -d 1234 --object ai:0

# Read object name
edgeo-bacnet read -d 1234 --object ai:0 --property object-name

# Read priority array element
edgeo-bacnet read -d 1234 --object ao:0 --property priority-array --index 8

# Read from specific host
edgeo-bacnet read -H 192.168.1.100 -d 1234 --object ai:0

# JSON output
edgeo-bacnet read -d 1234 --object ai:0 -o json
```

## Command: write

Write property to an object.

### Usage

```bash
edgeo-bacnet write [flags]
```

### Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--device` | `-d` | Device instance ID (required) |
| `--object` | | Object identifier (required) |
| `--property` | | Property name (default: present-value) |
| `--value` | | Value to write (required) |
| `--priority` | | Write priority (1-16) |
| `--index` | | Array index |

### Examples

```bash
# Write present value
edgeo-bacnet write -d 1234 --object ao:0 --value 72.5

# Write with priority 8 (Manual Operator)
edgeo-bacnet write -d 1234 --object ao:0 --value 72.5 --priority 8

# Relinquish (write null)
edgeo-bacnet write -d 1234 --object ao:0 --value null --priority 8

# Write binary value
edgeo-bacnet write -d 1234 --object bo:0 --value true
edgeo-bacnet write -d 1234 --object bo:0 --value active
```

## Command: watch

Monitor property values in real-time.

### Usage

```bash
edgeo-bacnet watch [flags]
```

### Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--device` | `-d` | Device instance ID (required) |
| `--object` | | Object identifiers (repeatable) |
| `--interval` | `-i` | Polling interval (default: 1s) |
| `--cov` | | Use COV subscriptions instead of polling |
| `--lifetime` | | COV subscription lifetime (default: 300s) |

### Examples

```bash
# Watch single object
edgeo-bacnet watch -d 1234 --object ai:0

# Watch multiple objects
edgeo-bacnet watch -d 1234 --object ai:0 --object ai:1 --object ao:0

# Watch with COV
edgeo-bacnet watch -d 1234 --object ai:0 --cov

# Faster polling
edgeo-bacnet watch -d 1234 --object ai:0 -i 500ms
```

## Command: dump

Dump all objects and properties from a device.

### Usage

```bash
edgeo-bacnet dump [flags]
```

### Flags

| Flag | Description |
|------|-------------|
| `--device` | Device instance ID (required) |
| `--file` | Output file |
| `--format` | Output format: json, csv |

### Examples

```bash
# Dump to console
edgeo-bacnet dump -d 1234

# Dump to JSON file
edgeo-bacnet dump -d 1234 --file device.json --format json

# Dump to CSV
edgeo-bacnet dump -d 1234 --file device.csv --format csv
```

## Command: info

Display device information.

### Usage

```bash
edgeo-bacnet info -d <device-id>
```

### Examples

```bash
# Get device info
edgeo-bacnet info -d 1234

# JSON output
edgeo-bacnet info -d 1234 -o json
```

**Output:**

```
Device Information
------------------
Instance ID:        1234
Object Name:        VAV-Controller-1
Vendor:             Tridium
Model:              JACE 8000
Firmware:           4.8.1.0
Application:        Niagara 4
Protocol Version:   1
Protocol Revision:  14
Segmentation:       Both
Max APDU Length:    1476
Objects:            42
```

## Command: interactive

Start an interactive REPL session.

### Usage

```bash
edgeo-bacnet interactive [flags]
```

### Shell Commands

| Command | Description |
|---------|-------------|
| `scan` | Discover devices |
| `read <dev> <obj> [prop]` | Read property |
| `write <dev> <obj> <value> [priority]` | Write property |
| `objects <dev>` | List device objects |
| `info <dev>` | Show device info |
| `help` | Show help |
| `quit` / `exit` | Exit shell |

### Example Session

```
$ edgeo-bacnet interactive
BACnet Interactive Shell
Type 'help' for available commands

bacnet> scan
Found 3 devices:
  1234 - VAV-Controller-1 (192.168.1.100)
  1235 - VAV-Controller-2 (192.168.1.101)
  1236 - AHU-Controller (192.168.1.102)

bacnet> read 1234 ai:0
AI:0 Present-Value = 72.5

bacnet> write 1234 ao:0 72.5 8
Written 72.5 to AO:0 at priority 8

bacnet> objects 1234
Device 1234 objects:
  AI:0  - Zone Temperature
  AI:1  - Supply Air Temp
  AO:0  - Damper Position
  BO:0  - Fan Command
  ...

bacnet> quit
Goodbye!
```

## Configuration File

Create `~/.edgeo-bacnet.yaml` for default settings:

```yaml
# Connection
port: 47808
timeout: 3s
retries: 3

# Network
local: ""
bbmd: ""

# Discovery
discover-timeout: 5s

# Output
output: table
verbose: false
```

## Environment Variables

Environment variables use the `BACNET_` prefix:

```bash
export BACNET_PORT=47808
export BACNET_TIMEOUT=3s
export BACNET_RETRIES=3
```

## Output Formats

### Table (default)

```
OBJECT     PROPERTY       VALUE
AI:0       present-value  72.5
AI:0       object-name    Zone Temp
AI:0       units          degrees-fahrenheit
```

### JSON

```json
{
  "object": "AI:0",
  "property": "present-value",
  "value": 72.5
}
```

### CSV

```csv
object,property,value
AI:0,present-value,72.5
AI:0,object-name,Zone Temp
```

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | Error (connection failed, read/write failed, etc.) |

## See Also

- [Client Library Documentation](client.md)
- [Configuration Options](options.md)
- [BACnet Object Reference](index.md#bacnet-object-reference)
