# Error Handling

The SNMP library provides detailed error types for proper error handling.

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

### Protocol Errors

```go
var (
    // ErrInvalidResponse - Invalid SNMP response
    ErrInvalidResponse = errors.New("invalid response")

    // ErrVersionMismatch - SNMP version mismatch
    ErrVersionMismatch = errors.New("version mismatch")

    // ErrRequestIDMismatch - Request ID mismatch
    ErrRequestIDMismatch = errors.New("request ID mismatch")
)
```

### OID Errors

```go
var (
    // ErrNoSuchObject - OID does not exist
    ErrNoSuchObject = errors.New("no such object")

    // ErrNoSuchInstance - Instance does not exist
    ErrNoSuchInstance = errors.New("no such instance")

    // ErrEndOfMibView - End of MIB reached
    ErrEndOfMibView = errors.New("end of MIB view")

    // ErrInvalidOID - Invalid OID format
    ErrInvalidOID = errors.New("invalid OID")
)
```

### SNMPv3 Errors

```go
var (
    // ErrAuthenticationFailure - SNMPv3 authentication failed
    ErrAuthenticationFailure = errors.New("authentication failure")

    // ErrDecryptionError - SNMPv3 decryption failed
    ErrDecryptionError = errors.New("decryption error")

    // ErrUnknownSecurityName - Unknown security name
    ErrUnknownSecurityName = errors.New("unknown security name")

    // ErrUnknownEngineID - Unknown engine ID
    ErrUnknownEngineID = errors.New("unknown engine ID")

    // ErrWrongDigest - Message digest verification failed
    ErrWrongDigest = errors.New("wrong digest")

    // ErrNotInTimeWindow - Message outside time window
    ErrNotInTimeWindow = errors.New("not in time window")
)
```

### SNMP Error Codes

```go
var (
    // ErrTooBig - Response too big
    ErrTooBig = errors.New("response too big")

    // ErrNoSuchName - OID not found (v1)
    ErrNoSuchName = errors.New("no such name")

    // ErrBadValue - Invalid value for SET
    ErrBadValue = errors.New("bad value")

    // ErrReadOnly - Attempted to SET read-only object
    ErrReadOnly = errors.New("read only")

    // ErrGenErr - General error
    ErrGenErr = errors.New("general error")

    // ErrNoAccess - Access denied
    ErrNoAccess = errors.New("no access")

    // ErrWrongType - Wrong type for SET
    ErrWrongType = errors.New("wrong type")

    // ErrWrongLength - Wrong length for SET
    ErrWrongLength = errors.New("wrong length")

    // ErrWrongValue - Wrong value for SET
    ErrWrongValue = errors.New("wrong value")

    // ErrNoCreation - Cannot create object
    ErrNoCreation = errors.New("no creation")

    // ErrInconsistentValue - Inconsistent value
    ErrInconsistentValue = errors.New("inconsistent value")

    // ErrResourceUnavailable - Resource unavailable
    ErrResourceUnavailable = errors.New("resource unavailable")

    // ErrCommitFailed - Commit failed
    ErrCommitFailed = errors.New("commit failed")

    // ErrUndoFailed - Undo failed
    ErrUndoFailed = errors.New("undo failed")

    // ErrAuthorizationError - Authorization error
    ErrAuthorizationError = errors.New("authorization error")

    // ErrNotWritable - Object not writable
    ErrNotWritable = errors.New("not writable")

    // ErrInconsistentName - Inconsistent name
    ErrInconsistentName = errors.New("inconsistent name")
)
```

## Error Handling Patterns

### Basic Error Handling

```go
result, err := client.Get(ctx, oid)
if err != nil {
    log.Printf("Error: %v", err)
    return
}
```

### Type-Based Error Handling

```go
result, err := client.Get(ctx, oid)
if err != nil {
    switch {
    case errors.Is(err, snmp.ErrTimeout):
        log.Println("Request timed out")
        log.Println("- Check network connectivity")
        log.Println("- Try increasing timeout")

    case errors.Is(err, snmp.ErrNoSuchObject):
        log.Printf("OID %s does not exist", oid)
        log.Println("- Verify OID is correct")
        log.Println("- Check MIB support on device")

    case errors.Is(err, snmp.ErrNoSuchInstance):
        log.Printf("Instance %s not found", oid)
        log.Println("- Object exists but instance doesn't")

    case errors.Is(err, snmp.ErrAuthenticationFailure):
        log.Println("SNMPv3 authentication failed")
        log.Println("- Check username and password")
        log.Println("- Verify auth protocol matches device config")

    case errors.Is(err, snmp.ErrDecryptionError):
        log.Println("SNMPv3 decryption failed")
        log.Println("- Check privacy password")
        log.Println("- Verify privacy protocol matches device config")

    default:
        log.Printf("Error: %v", err)
    }
}
```

### SET Error Handling

```go
err := client.Set(ctx, varbind)
if err != nil {
    switch {
    case errors.Is(err, snmp.ErrReadOnly):
        log.Printf("OID %s is read-only", varbind.OID)

    case errors.Is(err, snmp.ErrBadValue):
        log.Printf("Invalid value for OID %s", varbind.OID)

    case errors.Is(err, snmp.ErrWrongType):
        log.Printf("Wrong type for OID %s", varbind.OID)

    case errors.Is(err, snmp.ErrNoAccess):
        log.Printf("Access denied for OID %s", varbind.OID)

    case errors.Is(err, snmp.ErrNotWritable):
        log.Printf("OID %s is not writable", varbind.OID)

    default:
        log.Printf("SET error: %v", err)
    }
}
```

### Walk Error Handling

```go
err := client.WalkFunc(ctx, rootOID, func(vb snmp.VarBind) error {
    // Check for special error types in VarBind
    if vb.Type == snmp.TypeNoSuchObject {
        return snmp.ErrNoSuchObject
    }
    if vb.Type == snmp.TypeNoSuchInstance {
        return snmp.ErrNoSuchInstance
    }
    if vb.Type == snmp.TypeEndOfMibView {
        return snmp.ErrEndOfMibView
    }

    log.Printf("%s = %v", vb.OID, vb.Value)
    return nil
})

if err != nil && !errors.Is(err, snmp.ErrEndOfMibView) {
    log.Printf("Walk error: %v", err)
}
```

## Retry with Backoff

```go
func getWithRetry(ctx context.Context, client *snmp.Client, oid string) (*snmp.VarBind, error) {
    var lastErr error
    backoff := 100 * time.Millisecond

    for attempt := 0; attempt < 5; attempt++ {
        result, err := client.Get(ctx, oid)
        if err == nil {
            return &result[0], nil
        }

        lastErr = err

        // Don't retry on permanent errors
        if errors.Is(err, snmp.ErrNoSuchObject) ||
           errors.Is(err, snmp.ErrNoSuchInstance) ||
           errors.Is(err, snmp.ErrAuthenticationFailure) {
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
result, err := client.Get(ctx, oid)
if err != nil {
    return fmt.Errorf("failed to get %s from %s: %w", oid, target, err)
}
```

## Best Practices

1. **Always check errors** - Never ignore return errors
2. **Use errors.Is()** - For type-safe error comparison
3. **Add context** - Wrap errors with relevant information
4. **Handle gracefully** - Provide meaningful messages
5. **Retry transient errors** - Timeouts may be temporary
6. **Don't retry auth errors** - Fix configuration instead
