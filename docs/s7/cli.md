# edgeo-s7 - S7 Command Line Interface

A complete command-line tool for interacting with Siemens S7 PLCs.

## Installation

```bash
go build -o edgeo-s7 ./cmd/edgeo-s7
```

Or download a pre-built binary from the releases page.

## Commands Overview

| Command | Description |
|---------|-------------|
| `read` | Read from Data Blocks, inputs, outputs, markers |
| `write` | Write to Data Blocks, outputs, markers |
| `watch` | Monitor values with change detection |
| `scan` | Discover S7 devices on the network |
| `dump` | Dump memory to file |
| `info` | Display PLC information |
| `interactive` | Interactive REPL shell |
| `version` | Print version information |

## Global Flags

### Connection

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--host` | `-H` | - | PLC IP address (required) |
| `--rack` | `-r` | `0` | Rack number |
| `--slot` | `-s` | `1` | Slot number |
| `--timeout` | `-t` | `5s` | Request timeout |
| `--pdu-size` | | `960` | Maximum PDU size |

### Output

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--output` | `-o` | `table` | Format: table, json, csv, hex, raw |
| `--verbose` | `-v` | `false` | Verbose output |

### Configuration

| Flag | Description |
|------|-------------|
| `--config` | Config file path (default: `~/.edgeo-s7.yaml`) |

## Command: read

Read data from PLC memory areas.

### Usage

```bash
edgeo-s7 read [flags]
```

### Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--db` | `-d` | Data block number |
| `--area` | `-a` | Memory area: db, inputs, outputs, markers |
| `--start` | | Start byte address |
| `--length` | `-l` | Number of bytes to read |
| `--type` | | Data type: byte, int16, int32, float32, float64, bool |
| `--bit` | | Bit position (0-7) for boolean reads |

### Examples

```bash
# Read 10 bytes from DB1 starting at byte 0
edgeo-s7 read -H 192.168.1.10 --db 1 --start 0 --length 10

# Read as float32
edgeo-s7 read -H 192.168.1.10 --db 1 --start 100 --type float32

# Read boolean at DB1.DBX0.3
edgeo-s7 read -H 192.168.1.10 --db 1 --start 0 --bit 3 --type bool

# Read input bytes
edgeo-s7 read -H 192.168.1.10 --area inputs --start 0 --length 4

# Read markers
edgeo-s7 read -H 192.168.1.10 --area markers --start 0 --length 10

# JSON output
edgeo-s7 read -H 192.168.1.10 --db 1 --start 0 --length 10 -o json

# Hex output
edgeo-s7 read -H 192.168.1.10 --db 1 --start 0 --length 100 -o hex
```

## Command: write

Write data to PLC memory areas.

### Usage

```bash
edgeo-s7 write [flags]
```

### Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--db` | `-d` | Data block number |
| `--area` | `-a` | Memory area: db, outputs, markers |
| `--start` | | Start byte address |
| `--value` | | Value to write |
| `--type` | | Data type: byte, int16, int32, float32, float64, bool |
| `--bit` | | Bit position (0-7) for boolean writes |
| `--hex` | | Write hex string (e.g., "01020304") |

### Examples

```bash
# Write float32 value
edgeo-s7 write -H 192.168.1.10 --db 1 --start 100 --type float32 --value 25.5

# Write integer
edgeo-s7 write -H 192.168.1.10 --db 1 --start 10 --type int16 --value 1234

# Write boolean
edgeo-s7 write -H 192.168.1.10 --db 1 --start 0 --bit 3 --type bool --value true

# Write hex data
edgeo-s7 write -H 192.168.1.10 --db 1 --start 0 --hex "01020304AABBCCDD"

# Write to output
edgeo-s7 write -H 192.168.1.10 --area outputs --start 0 --hex "FF"
```

## Command: watch

Monitor values in real-time with change detection.

### Usage

```bash
edgeo-s7 watch [flags]
```

### Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--db` | `-d` | Data block number |
| `--area` | `-a` | Memory area |
| `--start` | | Start byte address |
| `--length` | `-l` | Number of bytes |
| `--interval` | `-i` | Polling interval (default: 1s) |
| `--changes` | | Only show changes |
| `--type` | | Interpret as type |

### Examples

```bash
# Watch DB1 bytes 0-9
edgeo-s7 watch -H 192.168.1.10 --db 1 --start 0 --length 10

# Watch with 500ms interval
edgeo-s7 watch -H 192.168.1.10 --db 1 --start 0 --length 10 -i 500ms

# Show only changes
edgeo-s7 watch -H 192.168.1.10 --db 1 --start 0 --length 10 --changes

# Watch as float32 values
edgeo-s7 watch -H 192.168.1.10 --db 1 --start 100 --length 4 --type float32
```

## Command: scan

Discover S7 devices on the network.

### Usage

```bash
edgeo-s7 scan [flags]
```

### Flags

| Flag | Description |
|------|-------------|
| `--network` | Network to scan (CIDR notation) |
| `--timeout` | Timeout per host |
| `--parallel` | Number of parallel scans |

### Examples

```bash
# Scan local network
edgeo-s7 scan --network 192.168.1.0/24

# Faster scan with more parallelism
edgeo-s7 scan --network 192.168.1.0/24 --parallel 50 --timeout 1s
```

## Command: dump

Dump PLC memory to a file.

### Usage

```bash
edgeo-s7 dump [flags]
```

### Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--db` | `-d` | Data block number |
| `--start` | | Start byte address |
| `--length` | `-l` | Number of bytes |
| `--file` | `-f` | Output file |
| `--format` | | Format: raw, hex, binary |

### Examples

```bash
# Dump DB1 to file
edgeo-s7 dump -H 192.168.1.10 --db 1 --start 0 --length 1000 -f db1.bin

# Dump as hex
edgeo-s7 dump -H 192.168.1.10 --db 1 --start 0 --length 100 -f db1.hex --format hex
```

## Command: info

Display PLC information.

### Usage

```bash
edgeo-s7 info -H <host>
```

### Examples

```bash
# Get PLC info
edgeo-s7 info -H 192.168.1.10

# JSON output
edgeo-s7 info -H 192.168.1.10 -o json
```

**Output:**

```
PLC Information
---------------
Host:           192.168.1.10
Rack:           0
Slot:           1
PDU Size:       480
Module Type:    S7-1500
Order Code:     6ES7 511-1AK02-0AB0
Serial:         S V-A12345678901
```

## Command: interactive

Start an interactive REPL session.

### Usage

```bash
edgeo-s7 interactive -H <host>
```

### Shell Commands

| Command | Description |
|---------|-------------|
| `connect` | Connect to PLC |
| `disconnect` | Disconnect |
| `status` | Show connection status |
| `read <db> <start> <length>` | Read data |
| `write <db> <start> <hex>` | Write data |
| `info` | Show PLC info |
| `help` | Show help |
| `quit` / `exit` | Exit shell |

### Example Session

```
$ edgeo-s7 interactive -H 192.168.1.10
S7 Interactive Shell
Type 'help' for available commands

s7[connected@192.168.1.10]> read 1 0 10
00 01 02 03 04 05 06 07 08 09

s7[connected@192.168.1.10]> write 1 0 AABBCCDD
Written 4 bytes to DB1.DBB0

s7[connected@192.168.1.10]> info
Module: S7-1500
PDU Size: 480

s7[connected@192.168.1.10]> quit
Goodbye!
```

## Configuration File

Create `~/.edgeo-s7.yaml` for default settings:

```yaml
# Connection
host: 192.168.1.10
rack: 0
slot: 1
timeout: 5s
pdu-size: 960

# Output
output: table
verbose: false
```

## Environment Variables

Environment variables use the `S7_` prefix:

```bash
export S7_HOST=192.168.1.10
export S7_RACK=0
export S7_SLOT=1
export S7_TIMEOUT=5s
```

## Output Formats

### Table (default)

```
Address     Type    Value
DB1.DBB0    BYTE    0x01
DB1.DBW2    INT     1234
DB1.DBD4    REAL    23.50
```

### JSON

```json
{
  "address": "DB1.DBD100",
  "type": "REAL",
  "value": 23.5
}
```

### Hex

```
00000000  01 02 03 04 05 06 07 08  09 0A 0B 0C 0D 0E 0F 10  |................|
00000010  11 12 13 14 15 16 17 18  19 1A 1B 1C 1D 1E 1F 20  |............... |
```

### Raw

Binary output to stdout (useful for piping).

## Exit Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | Error (connection failed, read/write failed, etc.) |

## See Also

- [Client Library Documentation](client.md)
- [Configuration Options](options.md)
- [Examples](examples/basic-client.md)
