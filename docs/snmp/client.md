# Client API

Complete documentation of the SNMP client API.

## Client Creation

### NewClient

Creates a new SNMP client instance.

```go
func NewClient(opts ...Option) *Client
```

**Example:**

```go
// SNMPv2c client
client := snmp.NewClient(
    snmp.WithTarget("192.168.1.1"),
    snmp.WithVersion(snmp.Version2c),
    snmp.WithCommunity("public"),
)

// SNMPv3 client
client := snmp.NewClient(
    snmp.WithTarget("192.168.1.1"),
    snmp.WithVersion(snmp.Version3),
    snmp.WithSecurityLevel(snmp.AuthPriv),
    snmp.WithSecurityName("admin"),
    snmp.WithAuth(snmp.AuthSHA256, "authpass"),
    snmp.WithPrivacy(snmp.PrivAES256, "privpass"),
)
```

## Connection Methods

### Connect

Establishes connection to the SNMP agent.

```go
func (c *Client) Connect(ctx context.Context) error
```

**Example:**

```go
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

if err := client.Connect(ctx); err != nil {
    log.Fatalf("Connection failed: %v", err)
}
```

### Close

Closes the connection.

```go
func (c *Client) Close() error
```

## GET Operations

### Get

Retrieves values for one or more OIDs.

```go
func (c *Client) Get(ctx context.Context, oids ...string) ([]VarBind, error)
```

**Example:**

```go
// Single OID
result, err := client.Get(ctx, "1.3.6.1.2.1.1.1.0")
if err != nil {
    log.Fatal(err)
}
log.Printf("System: %s", result[0].Value)

// Multiple OIDs
result, err := client.Get(ctx,
    snmp.OIDSysDescr,
    snmp.OIDSysName,
    snmp.OIDSysUpTime,
    snmp.OIDSysContact,
)
if err != nil {
    log.Fatal(err)
}

for _, vb := range result {
    log.Printf("%s = %v", vb.OID, vb.Value)
}
```

### GetNext

Retrieves the next OID(s) in the MIB tree.

```go
func (c *Client) GetNext(ctx context.Context, oids ...string) ([]VarBind, error)
```

**Example:**

```go
// Get next after system
result, err := client.GetNext(ctx, "1.3.6.1.2.1.1")
log.Printf("Next: %s = %v", result[0].OID, result[0].Value)
```

### GetBulk

Efficiently retrieves multiple OIDs (SNMPv2c/v3 only).

```go
func (c *Client) GetBulk(ctx context.Context, nonRepeaters, maxRepetitions int, oids ...string) ([]VarBind, error)
```

**Parameters:**
- `nonRepeaters` - Number of OIDs that should not be repeated
- `maxRepetitions` - Maximum iterations for remaining OIDs

**Example:**

```go
// Get interface descriptions (up to 20)
result, err := client.GetBulk(ctx, 0, 20, "1.3.6.1.2.1.2.2.1.2")
if err != nil {
    log.Fatal(err)
}

for _, vb := range result {
    log.Printf("Interface: %s", vb.Value)
}
```

## WALK Operations

### Walk

Traverses a MIB subtree and returns all results.

```go
func (c *Client) Walk(ctx context.Context, rootOID string) ([]VarBind, error)
```

**Example:**

```go
// Walk interfaces table
results, err := client.Walk(ctx, "1.3.6.1.2.1.2.2")
if err != nil {
    log.Fatal(err)
}

for _, vb := range results {
    log.Printf("%s = %v", vb.OID, vb.Value)
}
```

### WalkFunc

Traverses a MIB subtree with a callback function.

```go
func (c *Client) WalkFunc(ctx context.Context, rootOID string, fn WalkFunc) error

type WalkFunc func(vb VarBind) error
```

**Example:**

```go
// Walk with callback
err := client.WalkFunc(ctx, "1.3.6.1.2.1.2.2.1.2", func(vb snmp.VarBind) error {
    log.Printf("Interface: %s", vb.Value)
    return nil
})

// Stop walk early by returning error
count := 0
err := client.WalkFunc(ctx, "1.3.6.1.2.1.2.2", func(vb snmp.VarBind) error {
    count++
    if count >= 10 {
        return snmp.ErrWalkStop // Stop after 10 results
    }
    log.Printf("%s = %v", vb.OID, vb.Value)
    return nil
})
```

## SET Operations

### Set

Modifies one or more OID values.

```go
func (c *Client) Set(ctx context.Context, varbinds ...VarBind) error
```

**VarBind structure:**

```go
type VarBind struct {
    OID   string
    Type  Type
    Value interface{}
}
```

**Example:**

```go
// Set single value
err := client.Set(ctx, snmp.VarBind{
    OID:   snmp.OIDSysContact,
    Type:  snmp.TypeOctetString,
    Value: "admin@example.com",
})

// Set multiple values
err := client.Set(ctx,
    snmp.VarBind{
        OID:   snmp.OIDSysContact,
        Type:  snmp.TypeOctetString,
        Value: "admin@example.com",
    },
    snmp.VarBind{
        OID:   snmp.OIDSysLocation,
        Type:  snmp.TypeOctetString,
        Value: "Data Center",
    },
)

// Set integer value
err := client.Set(ctx, snmp.VarBind{
    OID:   "1.3.6.1.4.1.9.2.1.55.192.168.1.1",
    Type:  snmp.TypeInteger,
    Value: int32(1),
})
```

## Data Types

### VarBind

Represents an OID-value pair.

```go
type VarBind struct {
    OID   string      // Object identifier
    Type  Type        // ASN.1 type
    Value interface{} // Value (type depends on Type)
}
```

### SNMP Types

```go
const (
    TypeInteger          Type = 0x02
    TypeBitString        Type = 0x03
    TypeOctetString      Type = 0x04
    TypeNull             Type = 0x05
    TypeObjectIdentifier Type = 0x06
    TypeIPAddress        Type = 0x40
    TypeCounter32        Type = 0x41
    TypeGauge32          Type = 0x42
    TypeTimeTicks        Type = 0x43
    TypeOpaque           Type = 0x44
    TypeCounter64        Type = 0x46
    TypeNoSuchObject     Type = 0x80
    TypeNoSuchInstance   Type = 0x81
    TypeEndOfMibView     Type = 0x82
)
```

### Value Type Mapping

| SNMP Type | Go Type |
|-----------|---------|
| Integer | `int32` |
| OctetString | `[]byte` or `string` |
| ObjectIdentifier | `string` |
| IPAddress | `net.IP` |
| Counter32 | `uint32` |
| Gauge32 | `uint32` |
| TimeTicks | `uint32` |
| Counter64 | `uint64` |

## SNMP Versions

```go
const (
    Version1  Version = 0
    Version2c Version = 1
    Version3  Version = 3
)
```

## SNMPv3 Security

### Security Levels

```go
const (
    NoAuthNoPriv SecurityLevel = 1 // No authentication, no encryption
    AuthNoPriv   SecurityLevel = 2 // Authentication only
    AuthPriv     SecurityLevel = 3 // Authentication and encryption
)
```

### Authentication Protocols

```go
const (
    AuthNone   AuthProtocol = iota
    AuthMD5
    AuthSHA
    AuthSHA224
    AuthSHA256
    AuthSHA384
    AuthSHA512
)
```

### Privacy Protocols

```go
const (
    PrivNone    PrivProtocol = iota
    PrivDES
    PrivAES
    PrivAES192
    PrivAES256
    PrivAES192C  // Cisco variant
    PrivAES256C  // Cisco variant
)
```

## Metrics

### Metrics

Returns client metrics.

```go
func (c *Client) Metrics() *Metrics
```

**Example:**

```go
metrics := client.Metrics()
snapshot := metrics.Snapshot()

log.Printf("Requests sent: %d", snapshot.RequestsSent)
log.Printf("Requests succeeded: %d", snapshot.RequestsSucceeded)
log.Printf("Avg latency: %v", snapshot.AvgLatency)
```

## Complete Example

```go
package main

import (
    "context"
    "log"
    "time"

    "github.com/edgeo/drivers/snmp/snmp"
)

func main() {
    // Create SNMPv2c client
    client := snmp.NewClient(
        snmp.WithTarget("192.168.1.1"),
        snmp.WithVersion(snmp.Version2c),
        snmp.WithCommunity("public"),
        snmp.WithTimeout(5*time.Second),
        snmp.WithRetries(3),
    )

    ctx := context.Background()
    if err := client.Connect(ctx); err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    // Get system information
    result, err := client.Get(ctx,
        snmp.OIDSysDescr,
        snmp.OIDSysName,
        snmp.OIDSysUpTime,
    )
    if err != nil {
        log.Fatal(err)
    }

    log.Printf("System: %s", result[0].Value)
    log.Printf("Name: %s", result[1].Value)
    log.Printf("Uptime: %d ticks", result[2].Value)

    // Walk interfaces
    log.Println("\nInterfaces:")
    err = client.WalkFunc(ctx, "1.3.6.1.2.1.2.2.1.2", func(vb snmp.VarBind) error {
        log.Printf("  %s", vb.Value)
        return nil
    })
    if err != nil {
        log.Printf("Walk error: %v", err)
    }
}
```
