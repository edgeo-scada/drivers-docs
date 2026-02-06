# Example: S7 Client

A complete S7 TCP client example demonstrating the main features.

## Source Code

```go
package main

import (
    "context"
    "flag"
    "fmt"
    "log/slog"
    "os"
    "time"

    "github.com/edgeo-scada/drivers/s7"
)

func main() {
    addr := flag.String("addr", "192.168.1.100:102", "PLC address")
    rack := flag.Uint("rack", 0, "Rack number")
    slot := flag.Uint("slot", 1, "Slot number")
    flag.Parse()

    // Setup logging
    logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
        Level: slog.LevelInfo,
    }))

    // Create client
    client, err := s7.NewClient(*addr,
        s7.WithRack(s7.Rack(*rack)),
        s7.WithSlot(s7.Slot(*slot)),
        s7.WithTimeout(5*time.Second),
        s7.WithAutoReconnect(true),
        s7.WithLogger(logger),
    )
    if err != nil {
        fmt.Printf("Failed to create client: %v\n", err)
        os.Exit(1)
    }
    defer client.Close()

    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    // Connect
    fmt.Printf("Connecting to %s (rack=%d, slot=%d)...\n", *addr, *rack, *slot)
    if err := client.Connect(ctx); err != nil {
        fmt.Printf("Failed to connect: %v\n", err)
        os.Exit(1)
    }
    fmt.Printf("Connected! PDU size: %d\n", client.PDUSize())
    fmt.Println()

    // Read from DB1
    fmt.Println("=== Reading DB1 ===")
    data, err := client.ReadDB(ctx, 1, 0, 10)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
    } else {
        fmt.Printf("DB1.DBB0-9: %v\n", data)
    }
    fmt.Println()

    // Read typed values from DB1
    fmt.Println("=== Reading Typed Values ===")

    // Read INT at DB1.DBW100
    intVal, err := client.ReadInt16(ctx, s7.AreaDB, 1, 100)
    if err != nil {
        fmt.Printf("INT Error: %v\n", err)
    } else {
        fmt.Printf("DB1.DBW100 (INT): %d\n", intVal)
    }

    // Read DINT at DB1.DBD102
    dintVal, err := client.ReadInt32(ctx, s7.AreaDB, 1, 102)
    if err != nil {
        fmt.Printf("DINT Error: %v\n", err)
    } else {
        fmt.Printf("DB1.DBD102 (DINT): %d\n", dintVal)
    }

    // Read REAL at DB1.DBD106
    realVal, err := client.ReadFloat32(ctx, s7.AreaDB, 1, 106)
    if err != nil {
        fmt.Printf("REAL Error: %v\n", err)
    } else {
        fmt.Printf("DB1.DBD106 (REAL): %f\n", realVal)
    }

    // Read BOOL at DB1.DBX110.0
    boolVal, err := client.ReadBool(ctx, s7.AreaDB, 1, 110, 0)
    if err != nil {
        fmt.Printf("BOOL Error: %v\n", err)
    } else {
        fmt.Printf("DB1.DBX110.0 (BOOL): %v\n", boolVal)
    }
    fmt.Println()

    // Read process inputs
    fmt.Println("=== Reading Process Inputs ===")
    inputs, err := client.ReadInputs(ctx, 0, 4)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
    } else {
        fmt.Printf("IB0-3: %v\n", inputs)
    }
    fmt.Println()

    // Read process outputs
    fmt.Println("=== Reading Process Outputs ===")
    outputs, err := client.ReadOutputs(ctx, 0, 4)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
    } else {
        fmt.Printf("QB0-3: %v\n", outputs)
    }
    fmt.Println()

    // Read markers
    fmt.Println("=== Reading Markers ===")
    markers, err := client.ReadMarkers(ctx, 0, 8)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
    } else {
        fmt.Printf("MB0-7: %v\n", markers)
    }
    fmt.Println()

    // Write to DB1
    fmt.Println("=== Writing to DB1 ===")
    fmt.Println("Writing DB1.DBW200 = 1234")
    if err := client.WriteInt16(ctx, s7.AreaDB, 1, 200, 1234); err != nil {
        fmt.Printf("Error: %v\n", err)
    } else {
        fmt.Println("Success!")
    }

    fmt.Println("Writing DB1.DBD204 = 3.14159")
    if err := client.WriteFloat32(ctx, s7.AreaDB, 1, 204, 3.14159); err != nil {
        fmt.Printf("Error: %v\n", err)
    } else {
        fmt.Println("Success!")
    }

    fmt.Println("Writing DB1.DBX208.0 = TRUE")
    if err := client.WriteBool(ctx, s7.AreaDB, 1, 208, 0, true); err != nil {
        fmt.Printf("Error: %v\n", err)
    } else {
        fmt.Println("Success!")
    }
    fmt.Println()

    // Multi-item read
    fmt.Println("=== Multi-Item Read ===")
    items := []s7.DataItem{
        {Area: s7.AreaDB, DBNumber: 1, Start: 0, Amount: 10, WordLen: s7.TransportByte},
        {Area: s7.AreaMK, DBNumber: 0, Start: 0, Amount: 8, WordLen: s7.TransportByte},
    }
    results, err := client.ReadMulti(ctx, items)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
    } else {
        fmt.Printf("DB1.DBB0-9: %v\n", results[0])
        fmt.Printf("MB0-7: %v\n", results[1])
    }
    fmt.Println()

    // Print metrics
    fmt.Println("=== Client Metrics ===")
    snapshot := client.Metrics().Snapshot()
    fmt.Printf("Total requests: %d\n", snapshot.RequestsTotal)
    fmt.Printf("Successful requests: %d\n", snapshot.RequestsSuccess)
    fmt.Printf("Failed requests: %d\n", snapshot.RequestsErrors)
    fmt.Printf("Average latency: %v\n", snapshot.Latency.Avg)
    fmt.Printf("Min latency: %v\n", snapshot.Latency.Min)
    fmt.Printf("Max latency: %v\n", snapshot.Latency.Max)
    fmt.Printf("P95 latency: %v\n", snapshot.Latency.P95)

    fmt.Println("\nDone!")
}
```

## Running

```bash
# With default parameters
go run main.go

# With a specific PLC
go run main.go -addr 192.168.1.100:102

# With different rack/slot (S7-1200/1500)
go run main.go -addr 192.168.1.100:102 -rack 0 -slot 0
```

## Example Output

```
Connecting to 192.168.1.100:102 (rack=0, slot=1)...
Connected! PDU size: 480

=== Reading DB1 ===
DB1.DBB0-9: [0 0 4 210 0 0 0 0 64 73]

=== Reading Typed Values ===
DB1.DBW100 (INT): 1234
DB1.DBD102 (DINT): 567890
DB1.DBD106 (REAL): 3.141590
DB1.DBX110.0 (BOOL): true

=== Reading Process Inputs ===
IB0-3: [255 0 128 64]

=== Reading Process Outputs ===
QB0-3: [0 0 0 0]

=== Reading Markers ===
MB0-7: [85 170 0 0 0 0 0 0]

=== Writing to DB1 ===
Writing DB1.DBW200 = 1234
Success!
Writing DB1.DBD204 = 3.14159
Success!
Writing DB1.DBX208.0 = TRUE
Success!

=== Multi-Item Read ===
DB1.DBB0-9: [0 0 4 210 0 0 0 0 64 73]
MB0-7: [85 170 0 0 0 0 0 0]

=== Client Metrics ===
Total requests: 12
Successful requests: 12
Failed requests: 0
Average latency: 2.5ms
Min latency: 1.2ms
Max latency: 8.3ms
P95 latency: 5.1ms

Done!
```
