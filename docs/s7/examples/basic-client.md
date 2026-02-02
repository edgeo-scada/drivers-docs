# Basic Client Example

This example demonstrates basic read and write operations with an S7 PLC.

## Complete Example

```go
package main

import (
    "context"
    "encoding/binary"
    "fmt"
    "log"
    "math"
    "time"

    "github.com/edgeo/drivers/s7/s7"
)

func main() {
    // Create client for S7-1500
    client := s7.NewClient(
        "192.168.1.10",
        s7.WithRack(0),
        s7.WithSlot(1),
        s7.WithTimeout(5*time.Second),
        s7.WithAutoReconnect(true),
    )

    ctx := context.Background()

    // Connect to PLC
    if err := client.Connect(ctx); err != nil {
        log.Fatalf("Connection failed: %v", err)
    }
    defer client.Close()

    log.Println("Connected to S7 PLC")

    // Example 1: Read raw bytes
    readBytes(ctx, client)

    // Example 2: Read typed values
    readTypedValues(ctx, client)

    // Example 3: Read boolean (bit)
    readBoolean(ctx, client)

    // Example 4: Write values
    writeValues(ctx, client)

    // Example 5: Multi-item operations
    multiItemOperations(ctx, client)
}

func readBytes(ctx context.Context, client *s7.Client) {
    fmt.Println("\n=== Read Bytes ===")

    // Read 10 bytes from DB1 starting at byte 0
    data, err := client.ReadDB(ctx, 1, 0, 10)
    if err != nil {
        log.Printf("Read error: %v", err)
        return
    }

    fmt.Printf("DB1.DBB0-9: %v\n", data)
    fmt.Printf("Hex: %X\n", data)
}

func readTypedValues(ctx context.Context, client *s7.Client) {
    fmt.Println("\n=== Read Typed Values ===")

    // Read 16-bit integer at DB1.DBW10
    intVal, err := client.ReadInt16(ctx, s7.AreaDB, 1, 10)
    if err != nil {
        log.Printf("Read int16 error: %v", err)
    } else {
        fmt.Printf("DB1.DBW10 (Int16): %d\n", intVal)
    }

    // Read 32-bit integer at DB1.DBD20
    dintVal, err := client.ReadInt32(ctx, s7.AreaDB, 1, 20)
    if err != nil {
        log.Printf("Read int32 error: %v", err)
    } else {
        fmt.Printf("DB1.DBD20 (Int32): %d\n", dintVal)
    }

    // Read float at DB1.DBD100
    floatVal, err := client.ReadFloat32(ctx, s7.AreaDB, 1, 100)
    if err != nil {
        log.Printf("Read float32 error: %v", err)
    } else {
        fmt.Printf("DB1.DBD100 (Float32): %.2f\n", floatVal)
    }

    // Read 64-bit float at DB1.DBD200
    doubleVal, err := client.ReadFloat64(ctx, s7.AreaDB, 1, 200)
    if err != nil {
        log.Printf("Read float64 error: %v", err)
    } else {
        fmt.Printf("DB1.DBD200 (Float64): %.4f\n", doubleVal)
    }
}

func readBoolean(ctx context.Context, client *s7.Client) {
    fmt.Println("\n=== Read Boolean ===")

    // Read DB1.DBX0.0 (byte 0, bit 0)
    bit0, err := client.ReadBool(ctx, s7.AreaDB, 1, 0, 0)
    if err != nil {
        log.Printf("Read bool error: %v", err)
        return
    }
    fmt.Printf("DB1.DBX0.0: %v\n", bit0)

    // Read DB1.DBX0.7 (byte 0, bit 7)
    bit7, err := client.ReadBool(ctx, s7.AreaDB, 1, 0, 7)
    if err != nil {
        log.Printf("Read bool error: %v", err)
        return
    }
    fmt.Printf("DB1.DBX0.7: %v\n", bit7)
}

func writeValues(ctx context.Context, client *s7.Client) {
    fmt.Println("\n=== Write Values ===")

    // Write 16-bit integer
    err := client.WriteInt16(ctx, s7.AreaDB, 1, 10, 1234)
    if err != nil {
        log.Printf("Write int16 error: %v", err)
    } else {
        fmt.Println("Written 1234 to DB1.DBW10")
    }

    // Write float
    err = client.WriteFloat32(ctx, s7.AreaDB, 1, 100, 25.5)
    if err != nil {
        log.Printf("Write float32 error: %v", err)
    } else {
        fmt.Println("Written 25.5 to DB1.DBD100")
    }

    // Write boolean
    err = client.WriteBool(ctx, s7.AreaDB, 1, 0, 3, true)
    if err != nil {
        log.Printf("Write bool error: %v", err)
    } else {
        fmt.Println("Written true to DB1.DBX0.3")
    }

    // Write raw bytes
    data := []byte{0x01, 0x02, 0x03, 0x04}
    err = client.WriteDB(ctx, 1, 50, data)
    if err != nil {
        log.Printf("Write bytes error: %v", err)
    } else {
        fmt.Printf("Written %v to DB1.DBB50-53\n", data)
    }
}

func multiItemOperations(ctx context.Context, client *s7.Client) {
    fmt.Println("\n=== Multi-Item Read ===")

    // Define items to read
    items := []s7.ReadItem{
        {Area: s7.AreaDB, DBNumber: 1, Start: 0, Length: 4},   // Temperature (float)
        {Area: s7.AreaDB, DBNumber: 1, Start: 4, Length: 4},   // Pressure (float)
        {Area: s7.AreaDB, DBNumber: 1, Start: 8, Length: 2},   // Status (int16)
        {Area: s7.AreaDB, DBNumber: 1, Start: 10, Length: 1},  // Flags (byte)
    }

    results, err := client.ReadMulti(ctx, items)
    if err != nil {
        log.Printf("Multi-read error: %v", err)
        return
    }

    // Parse results
    temperature := math.Float32frombits(binary.BigEndian.Uint32(results[0]))
    pressure := math.Float32frombits(binary.BigEndian.Uint32(results[1]))
    status := int16(binary.BigEndian.Uint16(results[2]))
    flags := results[3][0]

    fmt.Printf("Temperature: %.2f °C\n", temperature)
    fmt.Printf("Pressure: %.2f bar\n", pressure)
    fmt.Printf("Status: %d\n", status)
    fmt.Printf("Flags: 0x%02X\n", flags)
}
```

## Reading from Different Areas

```go
// Read from process inputs (I)
inputs, err := client.ReadInputs(ctx, 0, 4) // IB0-IB3

// Read from process outputs (Q)
outputs, err := client.ReadOutputs(ctx, 0, 4) // QB0-QB3

// Read from markers (M)
markers, err := client.ReadMarkers(ctx, 0, 10) // MB0-MB9

// Generic area read
data, err := client.ReadArea(ctx, s7.AreaTimers, 0, 0, 2) // Timer 0
```

## Data Conversion Helpers

```go
// Convert bytes to types (Big Endian - S7 byte order)
func bytesToInt16(data []byte) int16 {
    return int16(binary.BigEndian.Uint16(data))
}

func bytesToInt32(data []byte) int32 {
    return int32(binary.BigEndian.Uint32(data))
}

func bytesToFloat32(data []byte) float32 {
    bits := binary.BigEndian.Uint32(data)
    return math.Float32frombits(bits)
}

func bytesToFloat64(data []byte) float64 {
    bits := binary.BigEndian.Uint64(data)
    return math.Float64frombits(bits)
}

// Convert types to bytes
func int16ToBytes(val int16) []byte {
    buf := make([]byte, 2)
    binary.BigEndian.PutUint16(buf, uint16(val))
    return buf
}

func float32ToBytes(val float32) []byte {
    buf := make([]byte, 4)
    binary.BigEndian.PutUint32(buf, math.Float32bits(val))
    return buf
}
```

## Error Handling

```go
data, err := client.ReadDB(ctx, 1, 0, 10)
if err != nil {
    switch {
    case errors.Is(err, s7.ErrNotConnected):
        log.Println("Not connected - attempting reconnect")
        client.Connect(ctx)
    case errors.Is(err, s7.ErrDBNotFound):
        log.Println("DB1 does not exist")
    case errors.Is(err, s7.ErrTimeout):
        log.Println("Request timed out")
    default:
        log.Printf("Error: %v", err)
    }
}
```
