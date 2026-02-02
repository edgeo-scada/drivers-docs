# Error Handling

The BACnet library provides detailed error types for proper error handling.

## Error Types

### Connection Errors

```go
var (
    // ErrNotConnected - Client is not connected
    ErrNotConnected = errors.New("not connected")

    // ErrTimeout - Request timed out
    ErrTimeout = errors.New("timeout")

    // ErrConnectionFailed - Connection failed
    ErrConnectionFailed = errors.New("connection failed")
)
```

### Device Errors

```go
var (
    // ErrDeviceNotFound - Device not found on network
    ErrDeviceNotFound = errors.New("device not found")

    // ErrDeviceUnreachable - Device is unreachable
    ErrDeviceUnreachable = errors.New("device unreachable")
)
```

### Object Errors

```go
var (
    // ErrObjectNotFound - Object does not exist on device
    ErrObjectNotFound = errors.New("object not found")

    // ErrPropertyNotFound - Property not supported by object
    ErrPropertyNotFound = errors.New("property not found")

    // ErrInvalidObjectType - Invalid object type
    ErrInvalidObjectType = errors.New("invalid object type")
)
```

### Value Errors

```go
var (
    // ErrInvalidValue - Invalid value for property
    ErrInvalidValue = errors.New("invalid value")

    // ErrValueOutOfRange - Value outside valid range
    ErrValueOutOfRange = errors.New("value out of range")

    // ErrWriteAccessDenied - Write access denied
    ErrWriteAccessDenied = errors.New("write access denied")

    // ErrReadAccessDenied - Read access denied
    ErrReadAccessDenied = errors.New("read access denied")
)
```

### Protocol Errors

```go
var (
    // ErrInvalidAPDU - Invalid APDU received
    ErrInvalidAPDU = errors.New("invalid APDU")

    // ErrSegmentationNotSupported - Segmentation required but not supported
    ErrSegmentationNotSupported = errors.New("segmentation not supported")

    // ErrAbort - Request was aborted
    ErrAbort = errors.New("request aborted")

    // ErrReject - Request was rejected
    ErrReject = errors.New("request rejected")
)
```

## Error Handling Patterns

### Basic Error Handling

```go
value, err := client.ReadProperty(ctx, deviceID, object, property)
if err != nil {
    log.Printf("Read error: %v", err)
    return
}
```

### Type-Based Error Handling

```go
value, err := client.ReadProperty(ctx, deviceID, object, property)
if err != nil {
    switch {
    case errors.Is(err, bacnet.ErrDeviceNotFound):
        log.Printf("Device %d not found on network", deviceID)
        log.Println("- Verify device is online")
        log.Println("- Check network connectivity")
        log.Println("- Try running WhoIs discovery")

    case errors.Is(err, bacnet.ErrTimeout):
        log.Printf("Request timed out")
        log.Println("- Device may be slow or busy")
        log.Println("- Try increasing timeout")

    case errors.Is(err, bacnet.ErrObjectNotFound):
        log.Printf("Object %s does not exist on device", object)
        log.Println("- Verify object identifier")
        log.Println("- Check device object list")

    case errors.Is(err, bacnet.ErrPropertyNotFound):
        log.Printf("Property %s not supported by object", property)
        log.Println("- Not all properties are available on all objects")

    case errors.Is(err, bacnet.ErrReadAccessDenied):
        log.Printf("Read access denied for %s.%s", object, property)
        log.Println("- Check device security settings")

    default:
        log.Printf("Error: %v", err)
    }
}
```

### Write Error Handling

```go
err := client.WriteProperty(ctx, deviceID, object, property, value)
if err != nil {
    switch {
    case errors.Is(err, bacnet.ErrWriteAccessDenied):
        log.Println("Write access denied")
        log.Println("- Object may be read-only")
        log.Println("- Check device security settings")

    case errors.Is(err, bacnet.ErrValueOutOfRange):
        log.Printf("Value %v is out of range", value)
        log.Println("- Check high-limit and low-limit properties")

    case errors.Is(err, bacnet.ErrInvalidValue):
        log.Printf("Invalid value type for property")
        log.Println("- Check expected data type")

    default:
        log.Printf("Write error: %v", err)
    }
}
```

## BACnet Error Codes

The library maps BACnet error codes to Go errors:

| BACnet Error | Go Error | Description |
|--------------|----------|-------------|
| unknown-object | `ErrObjectNotFound` | Object doesn't exist |
| unknown-property | `ErrPropertyNotFound` | Property not supported |
| value-out-of-range | `ErrValueOutOfRange` | Value outside limits |
| write-access-denied | `ErrWriteAccessDenied` | Cannot write to property |
| read-access-denied | `ErrReadAccessDenied` | Cannot read property |
| invalid-data-type | `ErrInvalidValue` | Wrong data type |
| communication-disabled | `ErrDeviceUnreachable` | Device not responding |

## BACnet Abort Reasons

```go
// Abort reasons
const (
    AbortReasonOther                   = 0
    AbortReasonBufferOverflow          = 1
    AbortReasonInvalidAPDUInThisState  = 2
    AbortReasonPreemptedByHigherPriority = 3
    AbortReasonSegmentationNotSupported = 4
)
```

## BACnet Reject Reasons

```go
// Reject reasons
const (
    RejectReasonOther                    = 0
    RejectReasonBufferOverflow           = 1
    RejectReasonInconsistentParameters   = 2
    RejectReasonInvalidParameterDataType = 3
    RejectReasonInvalidTag               = 4
    RejectReasonMissingRequiredParameter = 5
    RejectReasonParameterOutOfRange      = 6
    RejectReasonTooManyArguments         = 7
    RejectReasonUndefinedEnumeration     = 8
    RejectReasonUnrecognizedService      = 9
)
```

## Retry with Backoff

```go
func readWithRetry(ctx context.Context, client *bacnet.Client, deviceID uint32, object bacnet.ObjectIdentifier, property bacnet.PropertyIdentifier) (interface{}, error) {
    var lastErr error
    backoff := 100 * time.Millisecond

    for attempt := 0; attempt < 5; attempt++ {
        value, err := client.ReadProperty(ctx, deviceID, object, property)
        if err == nil {
            return value, nil
        }

        lastErr = err

        // Don't retry on permanent errors
        if errors.Is(err, bacnet.ErrObjectNotFound) ||
           errors.Is(err, bacnet.ErrPropertyNotFound) ||
           errors.Is(err, bacnet.ErrReadAccessDenied) {
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
value, err := client.ReadProperty(ctx, deviceID, object, property)
if err != nil {
    return fmt.Errorf("failed to read %s.%s from device %d: %w",
        object, property, deviceID, err)
}
```

## Best Practices

1. **Always check errors** - Never ignore return errors
2. **Use errors.Is()** - For type-safe error comparison
3. **Add context** - Wrap errors with relevant information
4. **Handle gracefully** - Provide meaningful messages
5. **Retry transient errors** - Timeouts may be temporary
6. **Log appropriately** - Log errors for debugging
