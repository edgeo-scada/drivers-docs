# Error Handling

Documentation of MQTT 5.0 errors and reason codes.

## Standard Errors

The library defines standard errors for common situations:

```go
var (
    ErrNotConnected        = errors.New("mqtt: not connected")
    ErrAlreadyConnected    = errors.New("mqtt: already connected")
    ErrConnectionLost      = errors.New("mqtt: connection lost")
    ErrTimeout             = errors.New("mqtt: operation timed out")
    ErrInvalidQoS          = errors.New("mqtt: invalid QoS level")
    ErrInvalidTopic        = errors.New("mqtt: invalid topic")
    ErrMalformedPacket     = errors.New("mqtt: malformed packet")
    ErrProtocolError       = errors.New("mqtt: protocol error")
    ErrClientClosed        = errors.New("mqtt: client closed")
)
```

### Error Checking

```go
token := client.Publish(ctx, topic, payload, mqtt.QoS1, false)
if err := token.Wait(); err != nil {
    switch {
    case errors.Is(err, mqtt.ErrNotConnected):
        log.Println("Client not connected, attempting reconnect...")
    case errors.Is(err, mqtt.ErrTimeout):
        log.Println("Publish timeout")
    default:
        log.Printf("Error: %v", err)
    }
}
```

## MQTT 5.0 Reason Codes

MQTT 5.0 uses detailed reason codes for each operation.

### ReasonCode

```go
type ReasonCode byte
```

### Success Codes

| Code | Constant | Description |
|------|----------|-------------|
| 0x00 | `ReasonSuccess` | Success / QoS 0 granted |
| 0x01 | `ReasonGrantedQoS1` | QoS 1 granted |
| 0x02 | `ReasonGrantedQoS2` | QoS 2 granted |
| 0x04 | `ReasonDisconnectWithWill` | Disconnect with Will |
| 0x10 | `ReasonNoMatchingSubscribers` | No matching subscribers |
| 0x11 | `ReasonNoSubscriptionExisted` | No subscription existed |
| 0x18 | `ReasonContinueAuthentication` | Continue authentication |
| 0x19 | `ReasonReAuthenticate` | Re-authenticate |

### Error Codes

| Code | Constant | Description |
|------|----------|-------------|
| 0x80 | `ReasonUnspecifiedError` | Unspecified error |
| 0x81 | `ReasonMalformedPacket` | Malformed packet |
| 0x82 | `ReasonProtocolError` | Protocol error |
| 0x83 | `ReasonImplementationError` | Implementation error |
| 0x84 | `ReasonUnsupportedProtocolVersion` | Unsupported protocol version |
| 0x85 | `ReasonClientIDNotValid` | Invalid client ID |
| 0x86 | `ReasonBadUsernameOrPassword` | Bad username or password |
| 0x87 | `ReasonNotAuthorized` | Not authorized |
| 0x88 | `ReasonServerUnavailable` | Server unavailable |
| 0x89 | `ReasonServerBusy` | Server busy |
| 0x8A | `ReasonBanned` | Client banned |
| 0x8B | `ReasonServerShuttingDown` | Server shutting down |
| 0x8C | `ReasonBadAuthenticationMethod` | Bad authentication method |
| 0x8D | `ReasonKeepAliveTimeout` | Keep alive timeout |
| 0x8E | `ReasonSessionTakenOver` | Session taken over by another client |
| 0x8F | `ReasonTopicFilterInvalid` | Invalid topic filter |
| 0x90 | `ReasonTopicNameInvalid` | Invalid topic name |
| 0x91 | `ReasonPacketIDInUse` | Packet ID already in use |
| 0x92 | `ReasonPacketIDNotFound` | Packet ID not found |
| 0x93 | `ReasonReceiveMaximumExceeded` | Receive maximum exceeded |
| 0x94 | `ReasonTopicAliasInvalid` | Invalid topic alias |
| 0x95 | `ReasonPacketTooLarge` | Packet too large |
| 0x96 | `ReasonMessageRateTooHigh` | Message rate too high |
| 0x97 | `ReasonQuotaExceeded` | Quota exceeded |
| 0x98 | `ReasonAdministrativeAction` | Administrative action |
| 0x99 | `ReasonPayloadFormatInvalid` | Invalid payload format |
| 0x9A | `ReasonRetainNotSupported` | Retain not supported |
| 0x9B | `ReasonQoSNotSupported` | QoS not supported |
| 0x9C | `ReasonUseAnotherServer` | Use another server |
| 0x9D | `ReasonServerMoved` | Server moved |
| 0x9E | `ReasonSharedSubsNotSupported` | Shared subscriptions not supported |
| 0x9F | `ReasonConnectionRateExceeded` | Connection rate exceeded |
| 0xA0 | `ReasonMaxConnectTime` | Maximum connect time |
| 0xA1 | `ReasonSubIDNotSupported` | Subscription ID not supported |
| 0xA2 | `ReasonWildcardSubsNotSupported` | Wildcards not supported |

### ReasonCode Methods

```go
// Convert to string
code.String() string

// Check if it's an error
code.IsError() bool

// Convert to Go error
code.ToError() error
```

## Error Types

### MQTTError

Generic MQTT error with reason code.

```go
type MQTTError struct {
    Code       ReasonCode
    Message    string
    Properties *Properties
}

func (e *MQTTError) Error() string
```

**Example:**

```go
if err := token.Wait(); err != nil {
    var mqttErr *mqtt.MQTTError
    if errors.As(err, &mqttErr) {
        log.Printf("MQTT error: code=%s, message=%s",
            mqttErr.Code.String(), mqttErr.Message)

        if mqttErr.Properties != nil && mqttErr.Properties.ReasonString != "" {
            log.Printf("Reason: %s", mqttErr.Properties.ReasonString)
        }
    }
}
```

### ConnectError

Connection error with details.

```go
type ConnectError struct {
    Code       ReasonCode
    Properties *Properties
}

func (e *ConnectError) Error() string
```

**Example:**

```go
if err := client.Connect(ctx); err != nil {
    var connErr *mqtt.ConnectError
    if errors.As(err, &connErr) {
        switch connErr.Code {
        case mqtt.ReasonBadUsernameOrPassword:
            log.Println("Invalid credentials")
        case mqtt.ReasonNotAuthorized:
            log.Println("Access not authorized")
        case mqtt.ReasonServerUnavailable:
            log.Println("Server unavailable")
        case mqtt.ReasonBanned:
            log.Println("Client banned")
        default:
            log.Printf("Connection refused: %s", connErr.Code.String())
        }

        // Check if server suggests a redirect
        if connErr.Properties != nil && connErr.Properties.ServerReference != "" {
            log.Printf("Suggested redirect: %s", connErr.Properties.ServerReference)
        }
    }
}
```

### DisconnectError

Disconnection error initiated by the server.

```go
type DisconnectError struct {
    Code       ReasonCode
    Properties *Properties
}

func (e *DisconnectError) Error() string
```

**Example:**

```go
client := mqtt.NewClient(
    mqtt.WithOnConnectionLost(func(c *mqtt.Client, err error) {
        var discErr *mqtt.DisconnectError
        if errors.As(err, &discErr) {
            switch discErr.Code {
            case mqtt.ReasonSessionTakenOver:
                log.Println("Session taken over by another client")
            case mqtt.ReasonKeepAliveTimeout:
                log.Println("Keep alive timeout")
            case mqtt.ReasonAdministrativeAction:
                log.Println("Disconnected by administrator")
            case mqtt.ReasonServerShuttingDown:
                log.Println("Server shutting down")
            default:
                log.Printf("Disconnected: %s", discErr.Code.String())
            }
        }
    }),
)
```

## Error Handling by Operation

### Connection

```go
func connectWithRetry(client *mqtt.Client) error {
    backoff := time.Second

    for i := 0; i < 5; i++ {
        ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
        err := client.Connect(ctx)
        cancel()

        if err == nil {
            return nil
        }

        var connErr *mqtt.ConnectError
        if errors.As(err, &connErr) {
            // Non-recoverable errors
            switch connErr.Code {
            case mqtt.ReasonBanned,
                 mqtt.ReasonBadUsernameOrPassword,
                 mqtt.ReasonNotAuthorized:
                return err // Don't retry
            }
        }

        log.Printf("Attempt %d failed: %v", i+1, err)
        time.Sleep(backoff)
        backoff *= 2
    }

    return errors.New("connection failed after 5 attempts")
}
```

### Publishing

```go
func publish(client *mqtt.Client, topic string, payload []byte) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    token := client.Publish(ctx, topic, payload, mqtt.QoS1, false)

    select {
    case <-token.Done():
        if err := token.Error(); err != nil {
            var mqttErr *mqtt.MQTTError
            if errors.As(err, &mqttErr) {
                switch mqttErr.Code {
                case mqtt.ReasonPacketTooLarge:
                    return fmt.Errorf("message too large for broker")
                case mqtt.ReasonQuotaExceeded:
                    return fmt.Errorf("quota exceeded, retry later")
                case mqtt.ReasonTopicNameInvalid:
                    return fmt.Errorf("invalid topic: %s", topic)
                }
            }
            return err
        }
        return nil
    case <-ctx.Done():
        return mqtt.ErrTimeout
    }
}
```

### Subscription

```go
func subscribe(client *mqtt.Client, topic string, handler mqtt.MessageHandler) error {
    token := client.Subscribe(context.Background(), topic, mqtt.QoS1, handler)
    if err := token.Wait(); err != nil {
        var mqttErr *mqtt.MQTTError
        if errors.As(err, &mqttErr) {
            switch mqttErr.Code {
            case mqtt.ReasonTopicFilterInvalid:
                return fmt.Errorf("invalid topic filter: %s", topic)
            case mqtt.ReasonSharedSubsNotSupported:
                return fmt.Errorf("shared subscriptions not supported")
            case mqtt.ReasonWildcardSubsNotSupported:
                return fmt.Errorf("wildcards not supported")
            case mqtt.ReasonSubIDNotSupported:
                return fmt.Errorf("subscription IDs not supported")
            }
        }
        return err
    }

    // Check granted QoS
    if len(token.GrantedQoS) > 0 && token.GrantedQoS[0] < mqtt.QoS1 {
        log.Printf("Warning: requested QoS not granted, received QoS %d", token.GrantedQoS[0])
    }

    return nil
}
```

## Error Logging

```go
import "log/slog"

func logError(logger *slog.Logger, operation string, err error) {
    var mqttErr *mqtt.MQTTError
    var connErr *mqtt.ConnectError
    var discErr *mqtt.DisconnectError

    switch {
    case errors.As(err, &mqttErr):
        logger.Error("MQTT error",
            "operation", operation,
            "code", mqttErr.Code.String(),
            "code_hex", fmt.Sprintf("0x%02X", byte(mqttErr.Code)),
            "message", mqttErr.Message,
        )
    case errors.As(err, &connErr):
        logger.Error("Connection error",
            "operation", operation,
            "code", connErr.Code.String(),
        )
    case errors.As(err, &discErr):
        logger.Error("Disconnect error",
            "operation", operation,
            "code", discErr.Code.String(),
        )
    default:
        logger.Error("Error",
            "operation", operation,
            "error", err.Error(),
        )
    }
}
```
