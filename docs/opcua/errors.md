---
sidebar_position: 7
---

# Error Handling

The OPC UA package provides comprehensive error handling with specific error types and OPC UA status codes.

## Error Types

### Connection Errors

```go
var (
    // Connection already closed
    ErrConnectionClosed = errors.New("opcua: connection closed")

    // Not connected
    ErrNotConnected = errors.New("opcua: not connected")

    // Maximum retry count reached
    ErrMaxRetriesExceeded = errors.New("opcua: max retries exceeded")

    // Invalid response
    ErrInvalidResponse = errors.New("opcua: invalid response")

    // Timeout
    ErrTimeout = errors.New("opcua: operation timeout")
)
```

### OPC UA Errors

The `OPCUAError` type encapsulates OPC UA protocol errors:

```go
type OPCUAError struct {
    Service    ServiceID
    StatusCode StatusCode
    Message    string
}

func (e *OPCUAError) Error() string {
    return fmt.Sprintf("opcua: %s failed with status %s: %s",
        e.Service, e.StatusCode, e.Message)
}
```

## Status Codes

### Status Checking

```go
if result.StatusCode.IsBad() {
    // Error
}

if result.StatusCode.IsUncertain() {
    // Uncertain result
}

if result.StatusCode.IsGood() {
    // Success
}
```

### Common Status Codes

| Code | Name | Description |
|------|------|-------------|
| 0x00000000 | Good | Success |
| 0x80010000 | BadUnexpectedError | Unexpected error |
| 0x80020000 | BadInternalError | Internal error |
| 0x80030000 | BadOutOfMemory | Out of memory |
| 0x80040000 | BadResourceUnavailable | Resource unavailable |
| 0x80050000 | BadCommunicationError | Communication error |
| 0x80060000 | BadEncodingError | Encoding error |
| 0x80070000 | BadDecodingError | Decoding error |
| 0x80080000 | BadEncodingLimitsExceeded | Encoding limits exceeded |
| 0x80090000 | BadRequestTooLarge | Request too large |
| 0x800A0000 | BadResponseTooLarge | Response too large |
| 0x800B0000 | BadUnknownResponse | Unknown response |
| 0x80100000 | BadTimeout | Timeout |
| 0x80110000 | BadServiceUnsupported | Service not supported |
| 0x80120000 | BadShutdown | Shutting down |
| 0x80130000 | BadServerNotConnected | Server not connected |
| 0x80140000 | BadServerHalted | Server halted |
| 0x80150000 | BadNothingToDo | Nothing to do |
| 0x80160000 | BadTooManyOperations | Too many operations |

### Session Status Codes

| Code | Name | Description |
|------|------|-------------|
| 0x80250000 | BadSessionIdInvalid | Invalid session ID |
| 0x80260000 | BadSessionClosed | Session closed |
| 0x80270000 | BadSessionNotActivated | Session not activated |
| 0x80280000 | BadSubscriptionIdInvalid | Invalid subscription ID |

### Node Status Codes

| Code | Name | Description |
|------|------|-------------|
| 0x80330000 | BadNodeIdInvalid | Invalid NodeID |
| 0x80340000 | BadNodeIdUnknown | Unknown NodeID |
| 0x80350000 | BadAttributeIdInvalid | Invalid AttributeID |
| 0x80360000 | BadIndexRangeInvalid | Invalid index range |
| 0x80370000 | BadIndexRangeNoData | No data in index range |
| 0x803C0000 | BadNotReadable | Not readable |
| 0x803D0000 | BadNotWritable | Not writable |
| 0x803E0000 | BadOutOfRange | Out of range |
| 0x803F0000 | BadNotSupported | Not supported |

## Error Handling

### Basic Pattern

```go
results, err := client.Read(ctx, nodesToRead)
if err != nil {
    // Communication or protocol error
    log.Printf("Read error: %v", err)
    return err
}

// Check the status of each result
for i, result := range results {
    if result.StatusCode.IsBad() {
        log.Printf("Error on node %d: %s", i, result.StatusCode)
    }
}
```

### Error Type Identification

```go
results, err := client.Read(ctx, nodesToRead)
if err != nil {
    var opcuaErr *opcua.OPCUAError
    if errors.As(err, &opcuaErr) {
        // Specific OPC UA error
        fmt.Printf("Service: %s\n", opcuaErr.Service)
        fmt.Printf("Status: %s\n", opcuaErr.StatusCode)
        fmt.Printf("Message: %s\n", opcuaErr.Message)
    } else if errors.Is(err, opcua.ErrConnectionClosed) {
        // Connection closed
        return reconnect()
    } else if errors.Is(err, context.DeadlineExceeded) {
        // Timeout
        return retry()
    }
}
```

### Reconnection Errors

```go
if err := client.Connect(ctx); err != nil {
    var netErr net.Error
    if errors.As(err, &netErr) && netErr.Timeout() {
        // Network timeout
        log.Println("Connection timeout")
    } else if errors.Is(err, syscall.ECONNREFUSED) {
        // Connection refused
        log.Println("Server unavailable")
    }
}
```

## Automatic Retry

The client supports automatic reconnection:

```go
client, err := opcua.NewClient("localhost:4840",
    opcua.WithAutoReconnect(true),
    opcua.WithMaxRetries(5),
    opcua.WithReconnectBackoff(time.Second),
    opcua.WithMaxReconnectTime(30*time.Second),
)
```

## Error Logging

```go
// Configure logger with level
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelDebug,
}))

client, _ := opcua.NewClient("localhost:4840",
    opcua.WithLogger(logger),
)
```

Errors are automatically logged with their context:

```json
{
  "time": "2024-01-15T10:30:00Z",
  "level": "ERROR",
  "msg": "read failed",
  "service": "Read",
  "status_code": "BadNodeIdUnknown",
  "node_id": "ns=2;i=999"
}
```

## Custom Status Codes

```go
// Create a status code
status := opcua.StatusCode(0x80330000) // BadNodeIdInvalid

// Check flags
fmt.Printf("Is Bad: %v\n", status.IsBad())
fmt.Printf("Is Uncertain: %v\n", status.IsUncertain())
fmt.Printf("Is Good: %v\n", status.IsGood())

// Get message
fmt.Printf("Message: %s\n", status.String())
```

## Complete Example

```go
func readWithErrorHandling(client *opcua.Client, nodeID opcua.NodeID) (*opcua.DataValue, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    value, err := client.ReadValue(ctx, nodeID)
    if err != nil {
        // Classify the error
        var opcuaErr *opcua.OPCUAError
        if errors.As(err, &opcuaErr) {
            switch {
            case opcuaErr.StatusCode == opcua.BadNodeIdUnknown:
                return nil, fmt.Errorf("node %s not found", nodeID)
            case opcuaErr.StatusCode == opcua.BadNotReadable:
                return nil, fmt.Errorf("node %s not readable", nodeID)
            case opcuaErr.StatusCode == opcua.BadSessionIdInvalid:
                // Attempt reconnection
                if err := client.ConnectAndActivateSession(ctx); err != nil {
                    return nil, fmt.Errorf("reconnection failed: %w", err)
                }
                return readWithErrorHandling(client, nodeID) // Retry
            default:
                return nil, fmt.Errorf("OPC UA error: %w", err)
            }
        }

        if errors.Is(err, context.DeadlineExceeded) {
            return nil, fmt.Errorf("timeout reading %s", nodeID)
        }

        return nil, fmt.Errorf("unexpected error: %w", err)
    }

    // Check value status
    if value.StatusCode.IsBad() {
        return nil, fmt.Errorf("invalid value: %s", value.StatusCode)
    }

    if value.StatusCode.IsUncertain() {
        log.Printf("Warning: uncertain value for %s: %s", nodeID, value.StatusCode)
    }

    return value, nil
}
```
