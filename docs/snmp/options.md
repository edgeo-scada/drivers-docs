# Configuration Options

Complete reference for SNMP client configuration options.

## Connection Options

### WithTarget

Sets the SNMP agent address (required).

```go
snmp.WithTarget("192.168.1.1")
```

### WithPort

Sets the SNMP agent port.

```go
snmp.WithPort(161) // Default: 161
```

### WithVersion

Sets the SNMP version.

```go
snmp.WithVersion(snmp.Version2c) // Default: Version2c
```

**Values:**
- `snmp.Version1` - SNMPv1
- `snmp.Version2c` - SNMPv2c
- `snmp.Version3` - SNMPv3

## SNMPv1/v2c Options

### WithCommunity

Sets the community string for authentication.

```go
snmp.WithCommunity("public") // Default: "public"
```

## SNMPv3 Security Options

### WithSecurityLevel

Sets the SNMPv3 security level.

```go
snmp.WithSecurityLevel(snmp.AuthPriv)
```

**Values:**
- `snmp.NoAuthNoPriv` - No authentication, no encryption
- `snmp.AuthNoPriv` - Authentication only
- `snmp.AuthPriv` - Authentication and encryption

### WithSecurityName

Sets the SNMPv3 username.

```go
snmp.WithSecurityName("admin")
```

### WithAuth

Sets authentication protocol and passphrase.

```go
snmp.WithAuth(snmp.AuthSHA256, "myauthpassword")
```

**Authentication protocols:**
- `snmp.AuthNone` - No authentication
- `snmp.AuthMD5` - MD5 (not recommended)
- `snmp.AuthSHA` - SHA-1
- `snmp.AuthSHA224` - SHA-224
- `snmp.AuthSHA256` - SHA-256 (recommended)
- `snmp.AuthSHA384` - SHA-384
- `snmp.AuthSHA512` - SHA-512

### WithPrivacy

Sets privacy (encryption) protocol and passphrase.

```go
snmp.WithPrivacy(snmp.PrivAES256, "myprivpassword")
```

**Privacy protocols:**
- `snmp.PrivNone` - No encryption
- `snmp.PrivDES` - DES (not recommended)
- `snmp.PrivAES` - AES-128
- `snmp.PrivAES192` - AES-192
- `snmp.PrivAES256` - AES-256 (recommended)
- `snmp.PrivAES192C` - AES-192 (Cisco variant)
- `snmp.PrivAES256C` - AES-256 (Cisco variant)

### WithContextName

Sets the SNMPv3 context name.

```go
snmp.WithContextName("mycontext")
```

### WithContextEngineID

Sets the SNMPv3 context engine ID.

```go
snmp.WithContextEngineID("8000000001020304")
```

## Timeout Options

### WithTimeout

Sets the request timeout.

```go
snmp.WithTimeout(5*time.Second) // Default: 5s
```

### WithRetries

Sets the number of retry attempts.

```go
snmp.WithRetries(3) // Default: 3
```

## Bulk Options

### WithMaxOids

Sets the maximum OIDs per request.

```go
snmp.WithMaxOids(10) // Default: 10
```

### WithMaxRepetitions

Sets the max-repetitions for GetBulk.

```go
snmp.WithMaxRepetitions(20) // Default: 10
```

### WithNonRepeaters

Sets the non-repeaters for GetBulk.

```go
snmp.WithNonRepeaters(0) // Default: 0
```

## Reconnection Options

### WithAutoReconnect

Enables automatic reconnection.

```go
snmp.WithAutoReconnect(true) // Default: true
```

### WithMaxReconnectInterval

Sets the maximum reconnection interval.

```go
snmp.WithMaxReconnectInterval(2*time.Minute) // Default: 2 minutes
```

### WithConnectRetryInterval

Sets the initial retry interval.

```go
snmp.WithConnectRetryInterval(1*time.Second) // Default: 1s
```

### WithMaxConnectRetries

Sets the maximum reconnection attempts.

```go
snmp.WithMaxConnectRetries(10) // Default: unlimited
```

## Callback Options

### WithOnConnect

Sets callback for successful connection.

```go
snmp.WithOnConnect(func() {
    log.Println("Connected to SNMP agent")
})
```

### WithOnConnectionLost

Sets callback for lost connection.

```go
snmp.WithOnConnectionLost(func(err error) {
    log.Printf("Connection lost: %v", err)
})
```

### WithOnReconnecting

Sets callback for reconnection attempts.

```go
snmp.WithOnReconnecting(func(attempt int) {
    log.Printf("Reconnecting (attempt %d)", attempt)
})
```

## Logging Options

### WithLogger

Sets a custom logger.

```go
import "log/slog"

logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
snmp.WithLogger(logger)
```

## Complete Examples

### SNMPv2c Configuration

```go
client := snmp.NewClient(
    snmp.WithTarget("192.168.1.1"),
    snmp.WithPort(161),
    snmp.WithVersion(snmp.Version2c),
    snmp.WithCommunity("public"),
    snmp.WithTimeout(5*time.Second),
    snmp.WithRetries(3),
    snmp.WithMaxOids(10),
    snmp.WithMaxRepetitions(20),
)
```

### SNMPv3 AuthPriv Configuration

```go
client := snmp.NewClient(
    snmp.WithTarget("192.168.1.1"),
    snmp.WithVersion(snmp.Version3),
    snmp.WithSecurityLevel(snmp.AuthPriv),
    snmp.WithSecurityName("admin"),
    snmp.WithAuth(snmp.AuthSHA256, "authpassword123"),
    snmp.WithPrivacy(snmp.PrivAES256, "privpassword123"),
    snmp.WithTimeout(5*time.Second),
    snmp.WithRetries(3),
)
```

### SNMPv3 AuthNoPriv Configuration

```go
client := snmp.NewClient(
    snmp.WithTarget("192.168.1.1"),
    snmp.WithVersion(snmp.Version3),
    snmp.WithSecurityLevel(snmp.AuthNoPriv),
    snmp.WithSecurityName("admin"),
    snmp.WithAuth(snmp.AuthSHA, "authpassword"),
)
```

## Environment Variables

Options can be set via environment variables with the `SNMP_` prefix:

| Variable | Description |
|----------|-------------|
| `SNMP_TARGET` | Agent address |
| `SNMP_PORT` | Agent port |
| `SNMP_VERSION` | SNMP version (1, 2c, 3) |
| `SNMP_COMMUNITY` | Community string |
| `SNMP_TIMEOUT` | Request timeout |
| `SNMP_RETRIES` | Retry attempts |
| `SNMP_SECURITY_LEVEL` | SNMPv3 security level |
| `SNMP_SECURITY_NAME` | SNMPv3 username |

## Configuration File

The CLI tool supports YAML configuration in `~/.edgeo-snmp.yaml`:

```yaml
# Connection
target: 192.168.1.1
port: 161
version: "2c"
community: public

# Timeouts
timeout: 5s
retries: 3

# Bulk
max-oids: 10
max-repetitions: 20

# SNMPv3 (if version: "3")
security-level: authPriv
security-name: admin
auth-protocol: SHA256
auth-passphrase: authpass
priv-protocol: AES256
priv-passphrase: privpass

# Output
output: table
verbose: false
```

## Options Summary

| Option | Default | Description |
|--------|---------|-------------|
| `WithTarget` | - | Agent address (required) |
| `WithPort` | 161 | Agent port |
| `WithVersion` | Version2c | SNMP version |
| `WithCommunity` | "public" | Community string |
| `WithTimeout` | 5s | Request timeout |
| `WithRetries` | 3 | Retry attempts |
| `WithMaxOids` | 10 | Max OIDs per request |
| `WithMaxRepetitions` | 10 | GetBulk max-repetitions |
| `WithSecurityLevel` | NoAuthNoPriv | SNMPv3 security level |
| `WithSecurityName` | - | SNMPv3 username |
| `WithAuth` | - | Auth protocol and passphrase |
| `WithPrivacy` | - | Privacy protocol and passphrase |
| `WithAutoReconnect` | true | Enable auto-reconnect |
| `WithLogger` | nil | Custom logger |
