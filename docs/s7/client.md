# S7 TCP Client

The S7 TCP client enables communication with Siemens PLCs via the S7comm protocol.

## Creation

```go
client, err := s7.NewClient(addr string, opts ...Option) (*Client, error)
```

**Parameters:**
- `addr`: PLC address (e.g., `"192.168.1.100:102"`)
- `opts`: Configuration options (see [Options](./options.md))

**Example:**
```go
client, err := s7.NewClient("192.168.1.100:102",
    s7.WithRack(0),
    s7.WithSlot(1),
    s7.WithTimeout(5*time.Second),
    s7.WithAutoReconnect(true),
)
```

## Connection and Disconnection

### Connect

```go
func (c *Client) Connect(ctx context.Context) error
```

Establishes the TCP connection and performs S7 negotiation:
1. TCP connection
2. COTP connection establishment
3. S7 communication negotiation (PDU size)

```go
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

if err := client.Connect(ctx); err != nil {
    log.Fatal(err)
}
```

### Close

```go
func (c *Client) Close() error
```

Closes the connection gracefully.

```go
defer client.Close()
```

### Connection State

```go
func (c *Client) IsConnected() bool
func (c *Client) State() ConnectionState
```

Possible states: `StateDisconnected`, `StateConnecting`, `StateConnected`

### Connection Information

```go
// Negotiated PDU size
pduSize := client.PDUSize()

// Server address
addr := client.Address()
```

## Reading Data

### ReadDB

Reads bytes from a Data Block.

```go
func (c *Client) ReadDB(ctx context.Context, dbNumber uint16, start uint32, size uint16) ([]byte, error)
```

| Parameter | Description |
|-----------|-------------|
| `dbNumber` | DB number (1-65535) |
| `start` | Start address in bytes |
| `size` | Number of bytes to read |

```go
data, err := client.ReadDB(ctx, 1, 0, 10)
// Reads DB1.DBB0 to DB1.DBB9
```

### ReadInputs

Reads process inputs (I).

```go
func (c *Client) ReadInputs(ctx context.Context, start uint32, size uint16) ([]byte, error)
```

```go
inputs, err := client.ReadInputs(ctx, 0, 4)
// Reads IB0 to IB3
```

### ReadOutputs

Reads process outputs (Q).

```go
func (c *Client) ReadOutputs(ctx context.Context, start uint32, size uint16) ([]byte, error)
```

```go
outputs, err := client.ReadOutputs(ctx, 0, 4)
// Reads QB0 to QB3
```

### ReadMarkers

Reads markers/flags (M).

```go
func (c *Client) ReadMarkers(ctx context.Context, start uint32, size uint16) ([]byte, error)
```

```go
markers, err := client.ReadMarkers(ctx, 0, 8)
// Reads MB0 to MB7
```

### ReadArea

Reads data from any memory area.

```go
func (c *Client) ReadArea(ctx context.Context, area Area, dbNumber uint16, start uint32, amount uint16) ([]byte, error)
```

| Parameter | Description |
|-----------|-------------|
| `area` | Memory area (AreaDB, AreaPE, AreaPA, AreaMK, etc.) |
| `dbNumber` | DB number (0 for non-DB areas) |
| `start` | Start address |
| `amount` | Number of elements |

```go
data, err := client.ReadArea(ctx, s7.AreaDB, 1, 0, 10)
```

### ReadMulti

Reads multiple items in a single request.

```go
func (c *Client) ReadMulti(ctx context.Context, items []DataItem) ([][]byte, error)
```

```go
items := []s7.DataItem{
    {Area: s7.AreaDB, DBNumber: 1, Start: 0, Amount: 10, WordLen: s7.TransportByte},
    {Area: s7.AreaDB, DBNumber: 2, Start: 0, Amount: 20, WordLen: s7.TransportByte},
}

results, err := client.ReadMulti(ctx, items)
// results[0] = data from DB1
// results[1] = data from DB2
```

## Writing Data

### WriteDB

Writes bytes to a Data Block.

```go
func (c *Client) WriteDB(ctx context.Context, dbNumber uint16, start uint32, data []byte) error
```

```go
err := client.WriteDB(ctx, 1, 0, []byte{0x01, 0x02, 0x03})
```

### WriteOutputs

Writes to process outputs (Q).

```go
func (c *Client) WriteOutputs(ctx context.Context, start uint32, data []byte) error
```

```go
err := client.WriteOutputs(ctx, 0, []byte{0xFF})
// QB0 = 255
```

### WriteMarkers

Writes to markers/flags (M).

```go
func (c *Client) WriteMarkers(ctx context.Context, start uint32, data []byte) error
```

```go
err := client.WriteMarkers(ctx, 0, []byte{0x55, 0xAA})
// MB0 = 0x55, MB1 = 0xAA
```

### WriteArea

Writes to any memory area.

```go
func (c *Client) WriteArea(ctx context.Context, area Area, dbNumber uint16, start uint32, data []byte) error
```

### WriteMulti

Writes multiple items in a single request.

```go
func (c *Client) WriteMulti(ctx context.Context, items []DataItem) error
```

## Reading Typed Values

### ReadBool

Reads a bit.

```go
func (c *Client) ReadBool(ctx context.Context, area Area, dbNumber uint16, byteAddr uint32, bitAddr uint8) (bool, error)
```

```go
val, err := client.ReadBool(ctx, s7.AreaDB, 1, 10, 0)
// Reads DB1.DBX10.0
```

### ReadInt16 / ReadUint16

Reads a 16-bit integer.

```go
func (c *Client) ReadInt16(ctx context.Context, area Area, dbNumber uint16, start uint32) (int16, error)
func (c *Client) ReadUint16(ctx context.Context, area Area, dbNumber uint16, start uint32) (uint16, error)
```

```go
intVal, err := client.ReadInt16(ctx, s7.AreaDB, 1, 100)
// Reads DB1.DBW100 as INT
```

### ReadInt32 / ReadUint32

Reads a 32-bit integer.

```go
func (c *Client) ReadInt32(ctx context.Context, area Area, dbNumber uint16, start uint32) (int32, error)
func (c *Client) ReadUint32(ctx context.Context, area Area, dbNumber uint16, start uint32) (uint32, error)
```

```go
dintVal, err := client.ReadInt32(ctx, s7.AreaDB, 1, 102)
// Reads DB1.DBD102 as DINT
```

### ReadFloat32

Reads a 32-bit real (REAL).

```go
func (c *Client) ReadFloat32(ctx context.Context, area Area, dbNumber uint16, start uint32) (float32, error)
```

```go
realVal, err := client.ReadFloat32(ctx, s7.AreaDB, 1, 106)
// Reads DB1.DBD106 as REAL
```

### ReadFloat64

Reads a 64-bit real (LREAL).

```go
func (c *Client) ReadFloat64(ctx context.Context, area Area, dbNumber uint16, start uint32) (float64, error)
```

```go
lrealVal, err := client.ReadFloat64(ctx, s7.AreaDB, 1, 110)
// Reads DB1.DBD110 as LREAL (8 bytes)
```

### ReadString

Reads a string in S7 STRING format.

```go
func (c *Client) ReadString(ctx context.Context, area Area, dbNumber uint16, start uint32, maxLen uint16) (string, error)
```

The S7 STRING format: `maxLen(1) + actualLen(1) + chars(maxLen)`

```go
str, err := client.ReadString(ctx, s7.AreaDB, 1, 120, 32)
// Reads a STRING[32] from DB1.DBB120
```

## Writing Typed Values

### WriteBool

Writes a bit.

```go
func (c *Client) WriteBool(ctx context.Context, area Area, dbNumber uint16, byteAddr uint32, bitAddr uint8, value bool) error
```

```go
err := client.WriteBool(ctx, s7.AreaDB, 1, 10, 0, true)
// Writes DB1.DBX10.0 = TRUE
```

### WriteInt16 / WriteUint16

```go
func (c *Client) WriteInt16(ctx context.Context, area Area, dbNumber uint16, start uint32, value int16) error
func (c *Client) WriteUint16(ctx context.Context, area Area, dbNumber uint16, start uint32, value uint16) error
```

### WriteInt32 / WriteUint32

```go
func (c *Client) WriteInt32(ctx context.Context, area Area, dbNumber uint16, start uint32, value int32) error
func (c *Client) WriteUint32(ctx context.Context, area Area, dbNumber uint16, start uint32, value uint32) error
```

### WriteFloat32

```go
func (c *Client) WriteFloat32(ctx context.Context, area Area, dbNumber uint16, start uint32, value float32) error
```

### WriteFloat64

```go
func (c *Client) WriteFloat64(ctx context.Context, area Area, dbNumber uint16, start uint32, value float64) error
```

### WriteString

```go
func (c *Client) WriteString(ctx context.Context, area Area, dbNumber uint16, start uint32, maxLen uint16, value string) error
```

## Metrics

```go
metrics := client.Metrics().Snapshot()
fmt.Printf("Total requests: %d\n", metrics.RequestsTotal)
fmt.Printf("Successful requests: %d\n", metrics.RequestsSuccess)
fmt.Printf("Errors: %d\n", metrics.RequestsErrors)
fmt.Printf("Reconnections: %d\n", metrics.Reconnections)
```

See [Metrics](./metrics.md) for more details.
