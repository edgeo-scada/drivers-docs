# Error Handling

The S7 library provides detailed error types for proper error handling.

## Error Types

### Connection Errors

```go
var (
    // ErrConnectionRefused - PLC refused connection
    ErrConnectionRefused = errors.New("connection refused")

    // ErrConnectionClosed - Connection was closed
    ErrConnectionClosed = errors.New("connection closed")

    // ErrNotConnected - Client is not connected
    ErrNotConnected = errors.New("not connected")

    // ErrTimeout - Operation timed out
    ErrTimeout = errors.New("timeout")

    // ErrInvalidRackSlot - Invalid rack/slot configuration
    ErrInvalidRackSlot = errors.New("invalid rack or slot")
)
```

### Protocol Errors

```go
var (
    // ErrInvalidPDU - Invalid PDU received
    ErrInvalidPDU = errors.New("invalid PDU")

    // ErrPDUTooLarge - PDU exceeds maximum size
    ErrPDUTooLarge = errors.New("PDU too large")

    // ErrNegotiationFailed - PDU negotiation failed
    ErrNegotiationFailed = errors.New("negotiation failed")
)
```

### Data Errors

```go
var (
    // ErrInvalidAddress - Invalid memory address
    ErrInvalidAddress = errors.New("invalid address")

    // ErrInvalidArea - Invalid memory area
    ErrInvalidArea = errors.New("invalid area")

    // ErrInvalidDBNumber - Invalid data block number
    ErrInvalidDBNumber = errors.New("invalid DB number")

    // ErrDataTooLarge - Data exceeds PDU capacity
    ErrDataTooLarge = errors.New("data too large")

    // ErrAccessDenied - Access to memory area denied
    ErrAccessDenied = errors.New("access denied")

    // ErrDBNotFound - Data block does not exist
    ErrDBNotFound = errors.New("data block not found")
)
```

## Error Handling Patterns

### Basic Error Handling

```go
data, err := client.ReadDB(ctx, 1, 0, 10)
if err != nil {
    log.Printf("Read error: %v", err)
    return
}
```

### Type-Based Error Handling

```go
data, err := client.ReadDB(ctx, 1, 0, 10)
if err != nil {
    switch {
    case errors.Is(err, s7.ErrNotConnected):
        // Try to reconnect
        if reconnectErr := client.Connect(ctx); reconnectErr != nil {
            log.Fatal("Reconnect failed:", reconnectErr)
        }
        // Retry the operation
        data, err = client.ReadDB(ctx, 1, 0, 10)

    case errors.Is(err, s7.ErrTimeout):
        log.Println("Operation timed out - PLC may be busy")

    case errors.Is(err, s7.ErrDBNotFound):
        log.Printf("DB1 does not exist on this PLC")

    case errors.Is(err, s7.ErrAccessDenied):
        log.Printf("Access to DB1 is denied - check PLC security settings")

    default:
        log.Printf("Unexpected error: %v", err)
    }
}
```

### Connection Error Handling

```go
if err := client.Connect(ctx); err != nil {
    switch {
    case errors.Is(err, s7.ErrConnectionRefused):
        log.Println("PLC refused connection")
        log.Println("- Verify IP address is correct")
        log.Println("- Check PLC is powered on and reachable")
        log.Println("- Ensure port 102 is not blocked")

    case errors.Is(err, s7.ErrTimeout):
        log.Println("Connection timed out")
        log.Println("- PLC may be unreachable")
        log.Println("- Check network connectivity")

    case errors.Is(err, s7.ErrInvalidRackSlot):
        log.Println("Invalid rack/slot configuration")
        log.Println("- S7-1200/1500: rack=0, slot=1")
        log.Println("- S7-300/400: rack=0, slot=2")

    case errors.Is(err, s7.ErrNegotiationFailed):
        log.Println("PDU negotiation failed")
        log.Println("- Try reducing PDU size")

    default:
        log.Printf("Connection error: %v", err)
    }
}
```

## S7 Error Codes

The PLC returns specific error codes that are mapped to errors:

| Code | Error | Description |
|------|-------|-------------|
| 0x00 | - | No error |
| 0x01 | `ErrHardwareFault` | Hardware fault |
| 0x03 | `ErrAccessingObject` | Object access error |
| 0x05 | `ErrInvalidAddress` | Invalid address |
| 0x06 | `ErrDataTypeNotSupported` | Data type not supported |
| 0x07 | `ErrDataTypeInconsistent` | Data type inconsistent |
| 0x0A | `ErrDBNotFound` | Object does not exist |

## Retry with Backoff

```go
func readWithRetry(ctx context.Context, client *s7.Client, dbNum, start, length int) ([]byte, error) {
    var lastErr error
    backoff := 100 * time.Millisecond

    for attempt := 0; attempt < 5; attempt++ {
        data, err := client.ReadDB(ctx, dbNum, start, length)
        if err == nil {
            return data, nil
        }

        lastErr = err

        // Don't retry on permanent errors
        if errors.Is(err, s7.ErrDBNotFound) ||
           errors.Is(err, s7.ErrAccessDenied) ||
           errors.Is(err, s7.ErrInvalidAddress) {
            return nil, err
        }

        log.Printf("Attempt %d failed: %v, retrying in %v", attempt+1, err, backoff)

        select {
        case <-ctx.Done():
            return nil, ctx.Err()
        case <-time.After(backoff):
            backoff *= 2
            if backoff > 5*time.Second {
                backoff = 5 * time.Second
            }
        }
    }

    return nil, fmt.Errorf("all retries failed: %w", lastErr)
}
```

## Error Context

Wrap errors with additional context:

```go
data, err := client.ReadDB(ctx, dbNum, start, length)
if err != nil {
    return fmt.Errorf("failed to read DB%d.DBB%d (length %d): %w", dbNum, start, length, err)
}
```

## Best Practices

1. **Always check errors** - Never ignore return errors
2. **Use errors.Is()** - For type-safe error comparison
3. **Add context** - Wrap errors with relevant information
4. **Handle gracefully** - Provide meaningful error messages to users
5. **Log appropriately** - Log errors for debugging but don't expose internal details
6. **Retry transient errors** - Timeouts and connection issues may be temporary
