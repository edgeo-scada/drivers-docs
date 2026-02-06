# Getting Started

## Prerequisites

- Go 1.21 or higher

## Installation

```bash
go get github.com/edgeo-scada/s7/s7
```

## S7 Client

### Basic Connection

```go
package main

import (
    "context"
    "fmt"
    "log"
    "time"

    "github.com/edgeo-scada/s7/s7"
)

func main() {
    // Create the client
    client, err := s7.NewClient("192.168.1.100:102",
        s7.WithRack(0),
        s7.WithSlot(1),
        s7.WithTimeout(5*time.Second),
    )
    if err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    // Connect
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }

    fmt.Println("Connected!")
    fmt.Printf("Negotiated PDU size: %d\n", client.PDUSize())
}
```

### Reading Data

```go
// Read 10 bytes from DB1 at address 0
data, err := client.ReadDB(ctx, 1, 0, 10)
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Data: %v\n", data)

// Read process inputs (I0.0 to I3.7)
inputs, err := client.ReadInputs(ctx, 0, 4)
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Inputs: %v\n", inputs)

// Read process outputs
outputs, err := client.ReadOutputs(ctx, 0, 4)
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Outputs: %v\n", outputs)

// Read markers (flags)
markers, err := client.ReadMarkers(ctx, 0, 8)
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Markers: %v\n", markers)
```

### Reading Typed Values

```go
// Read a 16-bit integer (INT)
intVal, err := client.ReadInt16(ctx, s7.AreaDB, 1, 100)
if err != nil {
    log.Fatal(err)
}
fmt.Printf("INT: %d\n", intVal)

// Read a 32-bit integer (DINT)
dintVal, err := client.ReadInt32(ctx, s7.AreaDB, 1, 102)
if err != nil {
    log.Fatal(err)
}
fmt.Printf("DINT: %d\n", dintVal)

// Read a 32-bit real (REAL)
realVal, err := client.ReadFloat32(ctx, s7.AreaDB, 1, 106)
if err != nil {
    log.Fatal(err)
}
fmt.Printf("REAL: %f\n", realVal)

// Read a 64-bit real (LREAL)
lrealVal, err := client.ReadFloat64(ctx, s7.AreaDB, 1, 110)
if err != nil {
    log.Fatal(err)
}
fmt.Printf("LREAL: %f\n", lrealVal)

// Read a boolean (bit)
boolVal, err := client.ReadBool(ctx, s7.AreaDB, 1, 118, 0) // DB1.DBX118.0
if err != nil {
    log.Fatal(err)
}
fmt.Printf("BOOL: %v\n", boolVal)

// Read an S7 string
strVal, err := client.ReadString(ctx, s7.AreaDB, 1, 120, 32) // String[32]
if err != nil {
    log.Fatal(err)
}
fmt.Printf("STRING: %s\n", strVal)
```

### Writing Data

```go
// Write raw bytes to DB1
err := client.WriteDB(ctx, 1, 0, []byte{0x01, 0x02, 0x03})
if err != nil {
    log.Fatal(err)
}

// Write an INT
err = client.WriteInt16(ctx, s7.AreaDB, 1, 100, 1234)
if err != nil {
    log.Fatal(err)
}

// Write a REAL
err = client.WriteFloat32(ctx, s7.AreaDB, 1, 106, 3.14)
if err != nil {
    log.Fatal(err)
}

// Write a bit
err = client.WriteBool(ctx, s7.AreaDB, 1, 118, 0, true) // DB1.DBX118.0 = TRUE
if err != nil {
    log.Fatal(err)
}

// Write a string
err = client.WriteString(ctx, s7.AreaDB, 1, 120, 32, "Hello PLC!")
if err != nil {
    log.Fatal(err)
}

// Write to outputs
err = client.WriteOutputs(ctx, 0, []byte{0xFF}) // QB0 = 255
if err != nil {
    log.Fatal(err)
}

// Write to markers
err = client.WriteMarkers(ctx, 0, []byte{0x55, 0xAA}) // MB0-MB1
if err != nil {
    log.Fatal(err)
}
```

### Multi-Item Read

For optimal performance, use multi-item reads:

```go
items := []s7.DataItem{
    {Area: s7.AreaDB, DBNumber: 1, Start: 0, Amount: 10, WordLen: s7.TransportByte},
    {Area: s7.AreaDB, DBNumber: 2, Start: 0, Amount: 20, WordLen: s7.TransportByte},
    {Area: s7.AreaMK, DBNumber: 0, Start: 0, Amount: 8, WordLen: s7.TransportByte},
}

results, err := client.ReadMulti(ctx, items)
if err != nil {
    log.Fatal(err)
}

for i, data := range results {
    fmt.Printf("Item %d: %v\n", i, data)
}
```

## Connection Pool

For high-performance applications:

```go
// Create a pool
pool, err := s7.NewPool("192.168.1.100:102",
    s7.WithSize(10),
    s7.WithMaxIdleTime(5*time.Minute),
    s7.WithClientOptions(
        s7.WithRack(0),
        s7.WithSlot(1),
        s7.WithTimeout(5*time.Second),
    ),
)
if err != nil {
    log.Fatal(err)
}
defer pool.Close()

// Get a connection from the pool
client, err := pool.Get(ctx)
if err != nil {
    log.Fatal(err)
}

data, err := client.ReadDB(ctx, 1, 0, 10)
// ...

// Return the connection to the pool
pool.Put(client)
```

Or with the pool's direct methods:

```go
// The pool automatically manages connection acquisition/release
data, err := pool.ReadDB(ctx, 1, 0, 10)
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Data: %v\n", data)

// Writing via the pool
err = pool.WriteDB(ctx, 1, 100, []byte{0x01, 0x02})
if err != nil {
    log.Fatal(err)
}
```
