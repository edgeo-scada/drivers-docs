# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2024-02-01

### Added

- **S7 TCP Client**
  - Full S7comm protocol support
  - COTP connection with automatic negotiation
  - PDU size negotiation
  - Automatic reconnection with exponential backoff
  - Configuration via functional options
  - Built-in metrics (latency, counters, percentiles)
  - Structured logging via `slog`

- **Data Read/Write**
  - Memory areas: DB, I, Q, M, T, C
  - Types: Byte, Int, DInt, UInt, UDInt, Real, LReal, Bool, String
  - Multi-item read/write in a single request
  - Typed methods for each data type

- **Connection Pool**
  - Connection reuse
  - Automatic health checks
  - Idle time management
  - Direct methods (ReadDB, WriteDB, etc.)

- **CLI Tool (edgeo-s7)**
  - Commands: read, write, watch, scan, dump, info, interactive
  - Output formats: table, json, csv, hex
  - Configuration via file, env, or flags
  - Interactive mode

- **Error Handling**
  - Typed S7 errors (`S7Error`)
  - Data errors (`DataError`)
  - All standard error codes
  - Utility functions (`IsS7Error`, `IsDataError`, etc.)

- **Metrics**
  - Thread-safe atomic counters
  - Latency histogram with percentiles
  - Prometheus/expvar compatible export

### Supported PLCs

- S7-200, S7-200 Smart
- S7-300, S7-400
- S7-1200, S7-1500
- LOGO!

### Security

- Input validation on all operations
- Address overflow protection
- Configurable timeouts to prevent blocking

---

## Versioning Convention

This project uses [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Incompatible changes with previous versions
- **MINOR** (0.X.0): Backward-compatible new features
- **PATCH** (0.0.X): Backward-compatible bug fixes

### Accessing the Version

```go
import "github.com/edgeo-scada/drivers/s7"

// Version string
fmt.Println(s7.Version) // "1.0.0"
```
