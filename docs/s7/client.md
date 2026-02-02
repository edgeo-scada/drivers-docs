# Client API

Complete documentation of the S7 client API.

## Client Creation

### NewClient

Creates a new S7 client instance.

```go
func NewClient(address string, opts ...Option) *Client
```

**Parameters:**
- `address` - PLC IP address (e.g., "192.168.1.10")
- `opts` - Functional options for configuration

**Example:**

```go
client := s7.NewClient(
    "192.168.1.10",
    s7.WithRack(0),
    s7.WithSlot(1),
    s7.WithTimeout(5*time.Second),
)
```

## Connection Methods

### Connect

Establishes a connection to the PLC.

```go
func (c *Client) Connect(ctx context.Context) error
```

**Example:**

```go
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

if err := client.Connect(ctx); err != nil {
    log.Fatalf("Connection failed: %v", err)
}
```

### Close

Closes the connection to the PLC.

```go
func (c *Client) Close() error
```

**Example:**

```go
if err := client.Close(); err != nil {
    log.Printf("Error closing connection: %v", err)
}
```

### IsConnected

Returns the connection state.

```go
func (c *Client) IsConnected() bool
```

## Generic Read/Write

### ReadArea

Reads data from any memory area.

```go
func (c *Client) ReadArea(ctx context.Context, area Area, dbNumber, start, length int) ([]byte, error)
```

**Parameters:**
- `area` - Memory area (AreaDB, AreaInputs, AreaOutputs, AreaMarkers, AreaTimers, AreaCounters)
- `dbNumber` - Data block number (only for AreaDB)
- `start` - Start byte address
- `length` - Number of bytes to read

**Example:**

```go
// Read 10 bytes from DB1 starting at byte 0
data, err := client.ReadArea(ctx, s7.AreaDB, 1, 0, 10)
```

### WriteArea

Writes data to any memory area.

```go
func (c *Client) WriteArea(ctx context.Context, area Area, dbNumber, start int, data []byte) error
```

**Example:**

```go
// Write to DB1 at byte 0
err := client.WriteArea(ctx, s7.AreaDB, 1, 0, []byte{0x01, 0x02, 0x03})
```

## Data Block Operations

### ReadDB

Reads data from a Data Block.

```go
func (c *Client) ReadDB(ctx context.Context, dbNumber, start, length int) ([]byte, error)
```

**Example:**

```go
// Read DB1.DBB0 to DB1.DBB9 (10 bytes)
data, err := client.ReadDB(ctx, 1, 0, 10)
```

### WriteDB

Writes data to a Data Block.

```go
func (c *Client) WriteDB(ctx context.Context, dbNumber, start int, data []byte) error
```

**Example:**

```go
// Write to DB1 starting at byte 0
err := client.WriteDB(ctx, 1, 0, []byte{0x01, 0x02, 0x03, 0x04})
```

## Input/Output Operations

### ReadInputs

Reads process input bytes.

```go
func (c *Client) ReadInputs(ctx context.Context, start, length int) ([]byte, error)
```

**Example:**

```go
// Read IB0 to IB3
data, err := client.ReadInputs(ctx, 0, 4)
```

### ReadOutputs

Reads process output bytes.

```go
func (c *Client) ReadOutputs(ctx context.Context, start, length int) ([]byte, error)
```

### WriteOutputs

Writes to process outputs.

```go
func (c *Client) WriteOutputs(ctx context.Context, start int, data []byte) error
```

**Example:**

```go
// Write to QB0
err := client.WriteOutputs(ctx, 0, []byte{0xFF})
```

## Marker Operations

### ReadMarkers

Reads marker bytes.

```go
func (c *Client) ReadMarkers(ctx context.Context, start, length int) ([]byte, error)
```

### WriteMarkers

Writes to marker bytes.

```go
func (c *Client) WriteMarkers(ctx context.Context, start int, data []byte) error
```

## Boolean Operations

### ReadBool

Reads a single bit.

```go
func (c *Client) ReadBool(ctx context.Context, area Area, dbNumber, byteAddr, bitAddr int) (bool, error)
```

**Parameters:**
- `byteAddr` - Byte address
- `bitAddr` - Bit position within the byte (0-7)

**Example:**

```go
// Read DB1.DBX0.3 (byte 0, bit 3)
value, err := client.ReadBool(ctx, s7.AreaDB, 1, 0, 3)
```

### WriteBool

Writes a single bit.

```go
func (c *Client) WriteBool(ctx context.Context, area Area, dbNumber, byteAddr, bitAddr int, value bool) error
```

**Example:**

```go
// Set DB1.DBX0.3 to true
err := client.WriteBool(ctx, s7.AreaDB, 1, 0, 3, true)
```

## Integer Operations

### ReadInt16 / WriteInt16

16-bit signed integer operations.

```go
func (c *Client) ReadInt16(ctx context.Context, area Area, dbNumber, start int) (int16, error)
func (c *Client) WriteInt16(ctx context.Context, area Area, dbNumber, start int, value int16) error
```

### ReadUInt16 / WriteUInt16

16-bit unsigned integer operations.

```go
func (c *Client) ReadUInt16(ctx context.Context, area Area, dbNumber, start int) (uint16, error)
func (c *Client) WriteUInt16(ctx context.Context, area Area, dbNumber, start int, value uint16) error
```

### ReadInt32 / WriteInt32

32-bit signed integer operations.

```go
func (c *Client) ReadInt32(ctx context.Context, area Area, dbNumber, start int) (int32, error)
func (c *Client) WriteInt32(ctx context.Context, area Area, dbNumber, start int, value int32) error
```

### ReadUInt32 / WriteUInt32

32-bit unsigned integer operations.

```go
func (c *Client) ReadUInt32(ctx context.Context, area Area, dbNumber, start int) (uint32, error)
func (c *Client) WriteUInt32(ctx context.Context, area Area, dbNumber, start int, value uint32) error
```

## Float Operations

### ReadFloat32 / WriteFloat32

32-bit floating point operations.

```go
func (c *Client) ReadFloat32(ctx context.Context, area Area, dbNumber, start int) (float32, error)
func (c *Client) WriteFloat32(ctx context.Context, area Area, dbNumber, start int, value float32) error
```

**Example:**

```go
// Read temperature from DB1.DBD100
temp, err := client.ReadFloat32(ctx, s7.AreaDB, 1, 100)
log.Printf("Temperature: %.2f", temp)

// Write setpoint to DB1.DBD200
err = client.WriteFloat32(ctx, s7.AreaDB, 1, 200, 25.5)
```

### ReadFloat64 / WriteFloat64

64-bit floating point operations.

```go
func (c *Client) ReadFloat64(ctx context.Context, area Area, dbNumber, start int) (float64, error)
func (c *Client) WriteFloat64(ctx context.Context, area Area, dbNumber, start int, value float64) error
```

## Multi-Item Operations

### ReadMulti

Reads multiple items in a single request.

```go
func (c *Client) ReadMulti(ctx context.Context, items []ReadItem) ([][]byte, error)
```

**ReadItem structure:**

```go
type ReadItem struct {
    Area     Area
    DBNumber int
    Start    int
    Length   int
}
```

**Example:**

```go
items := []s7.ReadItem{
    {Area: s7.AreaDB, DBNumber: 1, Start: 0, Length: 10},
    {Area: s7.AreaDB, DBNumber: 1, Start: 100, Length: 4},
    {Area: s7.AreaDB, DBNumber: 2, Start: 0, Length: 20},
}

results, err := client.ReadMulti(ctx, items)
if err != nil {
    log.Fatal(err)
}

for i, data := range results {
    log.Printf("Item %d: %v", i, data)
}
```

### WriteMulti

Writes multiple items in a single request.

```go
func (c *Client) WriteMulti(ctx context.Context, items []WriteItem) error
```

**WriteItem structure:**

```go
type WriteItem struct {
    Area     Area
    DBNumber int
    Start    int
    Data     []byte
}
```

**Example:**

```go
items := []s7.WriteItem{
    {Area: s7.AreaDB, DBNumber: 1, Start: 0, Data: []byte{0x01, 0x02}},
    {Area: s7.AreaDB, DBNumber: 1, Start: 100, Data: []byte{0x00, 0x00, 0x80, 0x3F}}, // 1.0 as float
}

err := client.WriteMulti(ctx, items)
```

## Metrics

### Metrics

Returns client metrics.

```go
func (c *Client) Metrics() *Metrics
```

**Example:**

```go
metrics := client.Metrics()
snapshot := metrics.Snapshot()

log.Printf("Requests: %d", snapshot.RequestCount)
log.Printf("Errors: %d", snapshot.ErrorCount)
log.Printf("Avg latency: %v", snapshot.AvgLatency)
```

## Memory Areas

```go
const (
    AreaDB       Area = 0x84 // Data Blocks
    AreaInputs   Area = 0x81 // Process Inputs (I)
    AreaOutputs  Area = 0x82 // Process Outputs (Q)
    AreaMarkers  Area = 0x83 // Markers (M)
    AreaTimers   Area = 0x1D // Timers (T)
    AreaCounters Area = 0x1C // Counters (C)
)
```

## Complete Example

```go
package main

import (
    "context"
    "log"
    "time"

    "github.com/edgeo/drivers/s7/s7"
)

func main() {
    // Create client with auto-reconnect
    client := s7.NewClient(
        "192.168.1.10",
        s7.WithRack(0),
        s7.WithSlot(1),
        s7.WithTimeout(5*time.Second),
        s7.WithAutoReconnect(true),
    )

    ctx := context.Background()

    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    // Read multiple values
    items := []s7.ReadItem{
        {Area: s7.AreaDB, DBNumber: 1, Start: 0, Length: 4},   // Temperature
        {Area: s7.AreaDB, DBNumber: 1, Start: 4, Length: 4},   // Pressure
        {Area: s7.AreaDB, DBNumber: 1, Start: 8, Length: 2},   // Status
    }

    results, err := client.ReadMulti(ctx, items)
    if err != nil {
        log.Fatal(err)
    }

    // Parse results
    temp := s7.BytesToFloat32(results[0])
    pressure := s7.BytesToFloat32(results[1])
    status := s7.BytesToInt16(results[2])

    log.Printf("Temperature: %.2f", temp)
    log.Printf("Pressure: %.2f", pressure)
    log.Printf("Status: %d", status)

    // Write a setpoint
    err = client.WriteFloat32(ctx, s7.AreaDB, 1, 100, 25.0)
    if err != nil {
        log.Printf("Write error: %v", err)
    }
}
```
