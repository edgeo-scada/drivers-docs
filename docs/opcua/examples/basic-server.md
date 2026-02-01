---
sidebar_position: 2
---

# Example: Basic Server

This example shows how to create a simple OPC UA server with custom nodes.

## Complete Code

```go
// examples/server/main.go
package main

import (
    "context"
    "fmt"
    "log"
    "math/rand"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/edgeo/drivers/opcua"
)

func main() {
    // Create the server
    server, err := opcua.NewServer(
        opcua.WithServerEndpoint("opc.tcp://0.0.0.0:4840"),
        opcua.WithServerName("Demo OPC UA Server"),
        opcua.WithServerURI("urn:edgeo:demo:server"),
    )
    if err != nil {
        log.Fatalf("Error creating server: %v", err)
    }

    // Configure the address space
    setupAddressSpace(server)

    // Start data simulation
    go simulateData(server)

    // Graceful shutdown handling
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    sigCh := make(chan os.Signal, 1)
    signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

    go func() {
        sig := <-sigCh
        log.Printf("Signal received: %v, shutting down...", sig)
        cancel()
    }()

    // Start the server
    log.Println("OPC UA server started on opc.tcp://0.0.0.0:4840")
    log.Println("Press Ctrl+C to stop")

    if err := server.ListenAndServe(ctx); err != nil && err != context.Canceled {
        log.Fatalf("Server error: %v", err)
    }

    log.Println("Server stopped")
}

func setupAddressSpace(server *opcua.Server) {
    // Create a folder for our data
    server.AddFolder(
        opcua.NewNumericNodeID(2, 1),  // NodeID: ns=2;i=1
        "Sensors",
        opcua.NewNumericNodeID(0, 85), // Parent: Objects folder
    )

    // Add sensor variables
    server.AddNodeToFolder(
        opcua.NewNumericNodeID(2, 10),
        "Temperature",
        opcua.TypeDouble,
        25.0,
        opcua.NewNumericNodeID(2, 1),
    )

    server.AddNodeToFolder(
        opcua.NewNumericNodeID(2, 11),
        "Humidity",
        opcua.TypeDouble,
        50.0,
        opcua.NewNumericNodeID(2, 1),
    )

    server.AddNodeToFolder(
        opcua.NewNumericNodeID(2, 12),
        "Pressure",
        opcua.TypeDouble,
        1013.25,
        opcua.NewNumericNodeID(2, 1),
    )

    // Create a folder for actuators
    server.AddFolder(
        opcua.NewNumericNodeID(2, 2),
        "Actuators",
        opcua.NewNumericNodeID(0, 85),
    )

    // Actuator variables (read/write)
    server.AddNodeWithOptions(
        opcua.NewNumericNodeID(2, 20),
        &opcua.NodeOptions{
            BrowseName:   "Valve1",
            DisplayName:  "Valve 1",
            Description:  "Valve 1 position (0-100%)",
            DataType:     opcua.TypeDouble,
            InitialValue: 0.0,
            AccessLevel:  opcua.AccessLevelReadWrite,
            ParentNodeID: opcua.NewNumericNodeID(2, 2),
        },
    )

    server.AddNodeWithOptions(
        opcua.NewNumericNodeID(2, 21),
        &opcua.NodeOptions{
            BrowseName:   "Pump1",
            DisplayName:  "Pump 1",
            Description:  "Pump 1 state",
            DataType:     opcua.TypeBoolean,
            InitialValue: false,
            AccessLevel:  opcua.AccessLevelReadWrite,
            ParentNodeID: opcua.NewNumericNodeID(2, 2),
        },
    )

    // Add status variables
    server.AddFolder(
        opcua.NewNumericNodeID(2, 3),
        "Status",
        opcua.NewNumericNodeID(0, 85),
    )

    server.AddNodeToFolder(
        opcua.NewNumericNodeID(2, 30),
        "SystemStatus",
        opcua.TypeString,
        "Running",
        opcua.NewNumericNodeID(2, 3),
    )

    server.AddNodeToFolder(
        opcua.NewNumericNodeID(2, 31),
        "AlarmCount",
        opcua.TypeInt32,
        int32(0),
        opcua.NewNumericNodeID(2, 3),
    )

    // Add a method
    server.AddMethod(
        opcua.NewNumericNodeID(2, 100),
        opcua.NewNumericNodeID(0, 85),
        "ResetAlarms",
        nil, // No input arguments
        nil, // No output arguments
        func(ctx context.Context, inputs []opcua.Variant) ([]opcua.Variant, error) {
            log.Println("ResetAlarms method called")
            server.SetValue(opcua.NewNumericNodeID(2, 31), int32(0))
            return nil, nil
        },
    )

    server.AddMethod(
        opcua.NewNumericNodeID(2, 101),
        opcua.NewNumericNodeID(0, 85),
        "Calculate",
        []opcua.Argument{
            {Name: "a", DataType: opcua.TypeDouble},
            {Name: "b", DataType: opcua.TypeDouble},
            {Name: "operation", DataType: opcua.TypeString},
        },
        []opcua.Argument{
            {Name: "result", DataType: opcua.TypeDouble},
        },
        func(ctx context.Context, inputs []opcua.Variant) ([]opcua.Variant, error) {
            a := inputs[0].Value.(float64)
            b := inputs[1].Value.(float64)
            op := inputs[2].Value.(string)

            var result float64
            switch op {
            case "add":
                result = a + b
            case "sub":
                result = a - b
            case "mul":
                result = a * b
            case "div":
                if b == 0 {
                    return nil, fmt.Errorf("division by zero")
                }
                result = a / b
            default:
                return nil, fmt.Errorf("unknown operation: %s", op)
            }

            return []opcua.Variant{{Type: opcua.TypeDouble, Value: result}}, nil
        },
    )

    log.Println("Address space configured")
}

func simulateData(server *opcua.Server) {
    ticker := time.NewTicker(time.Second)
    defer ticker.Stop()

    baseTemp := 25.0
    baseHumidity := 50.0
    basePressure := 1013.25

    for range ticker.C {
        // Simulate temperature variations
        temp := baseTemp + (rand.Float64()-0.5)*2
        server.SetValueWithTimestamp(
            opcua.NewNumericNodeID(2, 10),
            temp,
            time.Now(),
        )

        // Simulate humidity variations
        humidity := baseHumidity + (rand.Float64()-0.5)*5
        server.SetValueWithTimestamp(
            opcua.NewNumericNodeID(2, 11),
            humidity,
            time.Now(),
        )

        // Simulate pressure variations
        pressure := basePressure + (rand.Float64()-0.5)*10
        server.SetValueWithTimestamp(
            opcua.NewNumericNodeID(2, 12),
            pressure,
            time.Now(),
        )

        // Occasionally simulate an alarm
        if rand.Float64() < 0.05 {
            currentAlarms, _ := server.GetValue(opcua.NewNumericNodeID(2, 31))
            if count, ok := currentAlarms.(int32); ok {
                server.SetValue(opcua.NewNumericNodeID(2, 31), count+1)
            }
        }
    }
}
```

## Running

```bash
# Build
go build -o server ./examples/server

# Run
./server
```

## Output

```
Address space configured
OPC UA server started on opc.tcp://0.0.0.0:4840
Press Ctrl+C to stop
```

## Address Space Structure

```
Root (i=84)
└── Objects (i=85)
    ├── Server (i=2253)
    │   └── ServerStatus, etc.
    ├── Sensors (ns=2;i=1)
    │   ├── Temperature (ns=2;i=10) - Double, ReadOnly
    │   ├── Humidity (ns=2;i=11) - Double, ReadOnly
    │   └── Pressure (ns=2;i=12) - Double, ReadOnly
    ├── Actuators (ns=2;i=2)
    │   ├── Valve1 (ns=2;i=20) - Double, ReadWrite
    │   └── Pump1 (ns=2;i=21) - Boolean, ReadWrite
    ├── Status (ns=2;i=3)
    │   ├── SystemStatus (ns=2;i=30) - String
    │   └── AlarmCount (ns=2;i=31) - Int32
    ├── ResetAlarms (ns=2;i=100) - Method
    └── Calculate (ns=2;i=101) - Method
```

## Testing with the CLI

```bash
# Browse
opcuacli browse -e opc.tcp://localhost:4840

# Read temperature
opcuacli read -e opc.tcp://localhost:4840 -n "ns=2;i=10"

# Write to valve
opcuacli write -e opc.tcp://localhost:4840 -n "ns=2;i=20" -v 50.0 -T double

# Subscribe to changes
opcuacli subscribe -e opc.tcp://localhost:4840 -n "ns=2;i=10" -n "ns=2;i=11" -n "ns=2;i=12"

# View server info
opcuacli info -e opc.tcp://localhost:4840
```

## Key Points

1. **Organize nodes in folders** for better navigation
2. **Clearly define access rights** (ReadOnly vs ReadWrite)
3. **Update values with timestamp** for process data
4. **Handle graceful shutdown** with system signals
5. **Use methods** for actions that require server-side logic
