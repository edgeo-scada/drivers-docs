# Error Handling

## Standard Errors

The package defines several sentinel errors:

| Error | Description |
|-------|-------------|
| `ErrInvalidResponse` | Malformed or unexpected response |
| `ErrInvalidFrame` | Malformed frame |
| `ErrTimeout` | Timeout exceeded |
| `ErrConnectionClosed` | Connection closed |
| `ErrNotConnected` | Client not connected |
| `ErrMaxRetriesExceeded` | Maximum number of retries exceeded |
| `ErrInvalidAddress` | Invalid address |
| `ErrInvalidLength` | Invalid length |
| `ErrInvalidParameter` | Invalid parameter |
| `ErrCOTPConnectionFailed` | COTP connection failed |
| `ErrS7NegotiationFailed` | S7 negotiation failed |
| `ErrPDUTooLarge` | PDU too large |
| `ErrPoolExhausted` | Connection pool exhausted |
| `ErrPoolClosed` | Connection pool closed |
| `ErrUnsupportedPLC` | Unsupported PLC type |
| `ErrDataTooLarge` | Data too large for a single request |
| `ErrWriteFailed` | Write failed |
| `ErrReadFailed` | Read failed |

### Error Checking

```go
import "errors"

data, err := client.ReadDB(ctx, 1, 0, 10)
if err != nil {
    if errors.Is(err, s7.ErrNotConnected) {
        // Reconnect
        client.Connect(ctx)
    } else if errors.Is(err, s7.ErrTimeout) {
        // Retry
    } else if errors.Is(err, s7.ErrMaxRetriesExceeded) {
        // Give up
    } else if errors.Is(err, s7.ErrPoolExhausted) {
        // Wait or increase pool size
    }
}
```

## S7 Errors (Protocol)

S7 protocol errors are represented by `S7Error`:

```go
type S7Error struct {
    ErrorClass ErrorClass
    ErrorCode  uint8
}
```

### Error Classes

| Code | Constant | Description |
|------|----------|-------------|
| 0x00 | `ErrClassNoError` | No error |
| 0x81 | `ErrClassApplication` | Application error |
| 0x82 | `ErrClassObjectDef` | Object definition error |
| 0x83 | `ErrClassNoResource` | Resource not available |
| 0x84 | `ErrClassServiceError` | Service error |
| 0x85 | `ErrClassSupplyError` | Supply error |
| 0x87 | `ErrClassAccessError` | Access error |

### S7 Error Checking

```go
data, err := client.ReadDB(ctx, 1, 0, 10)
if err != nil {
    var s7Err *s7.S7Error
    if errors.As(err, &s7Err) {
        switch s7Err.ErrorClass {
        case s7.ErrClassAccessError:
            log.Println("Access error - check permissions")
        case s7.ErrClassObjectDef:
            log.Println("Object does not exist - check DB number")
        case s7.ErrClassNoResource:
            log.Println("Resource unavailable")
        default:
            log.Printf("S7 error: %v\n", s7Err)
        }
    }
}
```

### Utility Functions

```go
// Check if it is an S7 error
if s7.IsS7Error(err) {
    // S7 protocol error
}

// Check for a specific error class
if s7.IsAccessError(err) {
    // Access error
}

if s7.IsObjectError(err) {
    // Object definition error (non-existent DB, etc.)
}
```

## Data Item Errors

Data item errors are represented by `DataError`:

```go
type DataError struct {
    Result DataItemResult
    Index  int
}
```

### Result Codes

| Code | Constant | Description |
|------|----------|-------------|
| 0x00 | `ResultReserved` | Reserved |
| 0x01 | `ResultHardwareError` | Hardware error |
| 0x03 | `ResultAccessingObject` | Object access not allowed |
| 0x05 | `ResultAddressOutOfRange` | Address out of range |
| 0x06 | `ResultDataTypeNotSupported` | Data type not supported |
| 0x07 | `ResultDataTypeInconsistent` | Data type inconsistent |
| 0x0A | `ResultObjectNotExist` | Object does not exist |
| 0xFF | `ResultSuccess` | Success |

### Data Error Checking

```go
data, err := client.ReadDB(ctx, 1, 1000, 10)
if err != nil {
    var dataErr *s7.DataError
    if errors.As(err, &dataErr) {
        switch dataErr.Result {
        case s7.ResultAddressOutOfRange:
            log.Printf("Address out of range at item %d\n", dataErr.Index)
        case s7.ResultObjectNotExist:
            log.Printf("Object does not exist (item %d)\n", dataErr.Index)
        default:
            log.Printf("Data error: %s (item %d)\n", dataErr.Result.String(), dataErr.Index)
        }
    }
}
```

### Utility Functions

```go
// Check if it is a data error
if s7.IsDataError(err) {
    // Data item error
}
```

## Connection Errors

### Handling with Automatic Reconnection

```go
client, _ := s7.NewClient("192.168.1.100:102",
    s7.WithAutoReconnect(true),
    s7.WithMaxRetries(5),
    s7.WithOnDisconnect(func(err error) {
        log.Printf("Disconnected: %v\n", err)
    }),
)

// Network errors are automatically handled with retry
data, err := client.ReadDB(ctx, 1, 0, 10)
if err != nil {
    // After 5 failed attempts
    if errors.Is(err, s7.ErrMaxRetriesExceeded) {
        log.Fatal("Unable to reach the PLC")
    }
}
```

### Manual Handling

```go
client, _ := s7.NewClient("192.168.1.100:102",
    s7.WithAutoReconnect(false),
)

data, err := client.ReadDB(ctx, 1, 0, 10)
if err != nil {
    if errors.Is(err, s7.ErrNotConnected) {
        // Manual reconnection
        if err := client.Connect(ctx); err != nil {
            log.Fatal(err)
        }
        // Retry
        data, err = client.ReadDB(ctx, 1, 0, 10)
    }
}
```

## Negotiation Errors

During connection, specific errors may occur:

```go
err := client.Connect(ctx)
if err != nil {
    if errors.Is(err, s7.ErrCOTPConnectionFailed) {
        log.Println("COTP failed - check rack/slot")
    } else if errors.Is(err, s7.ErrS7NegotiationFailed) {
        log.Println("S7 negotiation failed - PLC may not be compatible")
    }
}
```

## Best Practices

1. **Always check errors** - Never ignore returned errors

2. **Distinguish error types** - S7 errors (protocol), data errors, network errors

3. **Log errors** - For debugging and monitoring

4. **Use timeouts** - Avoid indefinite blocking

```go
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

data, err := client.ReadDB(ctx, 1, 0, 10)
if err != nil {
    if errors.Is(err, context.DeadlineExceeded) {
        log.Println("Timeout - the PLC is not responding")
    }
}
```

5. **Handle reconnection** - Either automatically or manually

```go
// With automatic reconnection
client, _ := s7.NewClient("...",
    s7.WithAutoReconnect(true),
    s7.WithMaxRetries(3),
)

// Or manual handling
for {
    data, err := client.ReadDB(ctx, 1, 0, 10)
    if err == nil {
        break
    }
    if errors.Is(err, s7.ErrNotConnected) {
        client.Connect(ctx)
        continue
    }
    return err
}
```
