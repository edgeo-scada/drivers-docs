# Changelog

Version history of the MQTT library.

## [1.0.0] - 2025-02-01

### First Stable Release

Initial release of the MQTT 5.0 client library in Go.

### Features

#### MQTT 5.0 Protocol
- Full MQTT 5.0 protocol support
- All packet types (CONNECT, PUBLISH, SUBSCRIBE, etc.)
- MQTT 5.0 properties (User Properties, Message Expiry, etc.)
- Detailed reason codes
- Topic aliases

#### Transports
- Standard TCP (port 1883)
- TLS/SSL (port 8883)
- WebSocket (port 80)
- WebSocket Secure (port 443)

#### Quality of Service
- QoS 0 (At most once)
- QoS 1 (At least once)
- QoS 2 (Exactly once)
- Complete QoS 2 flow handling

#### Connection
- Automatic reconnection with exponential backoff
- Keep-alive with PING/PONG
- Clean Start / Persistent session
- Will Message (Last Will and Testament)

#### Subscriptions
- Wildcards (+ and #)
- Subscription options (NoLocal, Retain handling)
- Per-topic handlers

#### Authentication
- Username/Password
- Client certificates (mTLS)
- Configurable TLS support

#### Advanced Features
- Connection pooling
- Built-in metrics
- Structured logging (slog)
- Functional options pattern

### API

```go
// Client creation
client := mqtt.NewClient(opts...)

// Connection
client.Connect(ctx)
client.Disconnect(ctx)

// Publishing
client.Publish(ctx, topic, payload, qos, retain)
client.PublishWithProperties(ctx, topic, payload, qos, retain, props)

// Subscription
client.Subscribe(ctx, topic, qos, handler)
client.SubscribeMultiple(ctx, subs, handler)
client.Unsubscribe(ctx, topics...)

// State
client.IsConnected()
client.State()
client.Metrics()
client.ServerProperties()
```

### Available Options

- `WithServer(uri)` - Broker URI
- `WithClientID(id)` - Client identifier
- `WithCredentials(user, pass)` - Authentication
- `WithCleanStart(bool)` - Clean session
- `WithKeepAlive(duration)` - Keep-alive interval
- `WithConnectTimeout(duration)` - Connection timeout
- `WithAutoReconnect(bool)` - Auto reconnection
- `WithTLS(config)` - TLS configuration
- `WithWebSocket(bool)` - WebSocket transport
- `WithWill(topic, payload, qos, retain)` - Will message
- And more...

### Dependencies

- `github.com/gorilla/websocket` v1.5.3 - WebSocket support

---

## Roadmap

### [1.1.0] - Planned

- [ ] Enhanced Authentication (AUTH packet)
- [ ] Shared Subscriptions
- [ ] Improved Flow Control
- [ ] OpenTelemetry metrics

### [1.2.0] - Planned

- [ ] Message persistence
- [ ] Offline queue
- [ ] Message compression
- [ ] Rate limiting

---

## Versioning Convention

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR**: Incompatible API changes
- **MINOR**: Backward-compatible new features
- **PATCH**: Backward-compatible bug fixes
