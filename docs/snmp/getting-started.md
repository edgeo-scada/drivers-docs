# Getting Started

This guide will help you get started with the SNMP client library.

## Installation

```bash
go get github.com/edgeo/drivers/snmp
```

## SNMPv2c Connection

Most devices support SNMPv2c with community string authentication:

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
        snmp.WithPort(161),
        snmp.WithVersion(snmp.Version2c),
        snmp.WithCommunity("public"),
        snmp.WithTimeout(5*time.Second),
    )

    ctx := context.Background()

    // Connect
    if err := client.Connect(ctx); err != nil {
        log.Fatalf("Connection failed: %v", err)
    }
    defer client.Close()

    log.Println("Connected to SNMP agent")
}
```

## SNMPv3 Connection

For secure communication, use SNMPv3 with authentication and encryption:

```go
client := snmp.NewClient(
    snmp.WithTarget("192.168.1.1"),
    snmp.WithVersion(snmp.Version3),
    snmp.WithSecurityLevel(snmp.AuthPriv),
    snmp.WithSecurityName("admin"),
    snmp.WithAuth(snmp.AuthSHA256, "authpassword"),
    snmp.WithPrivacy(snmp.PrivAES256, "privpassword"),
)
```

## GET Operation

Retrieve values by OID:

```go
// Get single OID
result, err := client.Get(ctx, "1.3.6.1.2.1.1.1.0")
if err != nil {
    log.Fatal(err)
}
log.Printf("Value: %v", result[0].Value)

// Get multiple OIDs
result, err := client.Get(ctx,
    snmp.OIDSysDescr,
    snmp.OIDSysName,
    snmp.OIDSysUpTime,
)
if err != nil {
    log.Fatal(err)
}

for _, vb := range result {
    log.Printf("%s = %v", vb.OID, vb.Value)
}
```

## GETNEXT Operation

Get the next OID in the MIB tree:

```go
result, err := client.GetNext(ctx, "1.3.6.1.2.1.1")
if err != nil {
    log.Fatal(err)
}
log.Printf("Next OID: %s = %v", result[0].OID, result[0].Value)
```

## GETBULK Operation (v2c/v3)

Efficiently retrieve multiple OIDs:

```go
// Get bulk with non-repeaters=0, max-repetitions=10
result, err := client.GetBulk(ctx, 0, 10,
    "1.3.6.1.2.1.2.2.1.2",  // ifDescr
)
if err != nil {
    log.Fatal(err)
}

for _, vb := range result {
    log.Printf("%s = %v", vb.OID, vb.Value)
}
```

## WALK Operation

Traverse a MIB subtree:

```go
// Walk the interfaces table
err := client.WalkFunc(ctx, "1.3.6.1.2.1.2.2", func(vb snmp.VarBind) error {
    log.Printf("%s = %v", vb.OID, vb.Value)
    return nil
})
if err != nil {
    log.Fatal(err)
}

// Or get all results at once
results, err := client.Walk(ctx, "1.3.6.1.2.1.2.2")
if err != nil {
    log.Fatal(err)
}
for _, vb := range results {
    log.Printf("%s = %v", vb.OID, vb.Value)
}
```

## SET Operation

Modify OID values:

```go
// Set system contact
err := client.Set(ctx, snmp.VarBind{
    OID:   snmp.OIDSysContact,
    Type:  snmp.TypeOctetString,
    Value: "admin@example.com",
})
if err != nil {
    log.Fatal(err)
}

// Set multiple values
err := client.Set(ctx,
    snmp.VarBind{OID: snmp.OIDSysContact, Type: snmp.TypeOctetString, Value: "admin@example.com"},
    snmp.VarBind{OID: snmp.OIDSysLocation, Type: snmp.TypeOctetString, Value: "Server Room"},
)
```

## Common OIDs

The library provides constants for common OIDs:

```go
snmp.OIDSysDescr      // 1.3.6.1.2.1.1.1.0 - System description
snmp.OIDSysObjectID   // 1.3.6.1.2.1.1.2.0 - System object ID
snmp.OIDSysUpTime     // 1.3.6.1.2.1.1.3.0 - Uptime in ticks
snmp.OIDSysContact    // 1.3.6.1.2.1.1.4.0 - Contact info
snmp.OIDSysName       // 1.3.6.1.2.1.1.5.0 - System name
snmp.OIDSysLocation   // 1.3.6.1.2.1.1.6.0 - Physical location
```

## Data Types

SNMP supports various data types:

| Type | Go Type | Description |
|------|---------|-------------|
| `Integer` | `int32` | 32-bit signed integer |
| `OctetString` | `[]byte` | Byte sequence (often text) |
| `ObjectIdentifier` | `string` | OID |
| `IPAddress` | `net.IP` | IPv4 address |
| `Counter32` | `uint32` | 32-bit counter |
| `Counter64` | `uint64` | 64-bit counter (v2c/v3) |
| `Gauge32` | `uint32` | 32-bit gauge |
| `TimeTicks` | `uint32` | Time in hundredths of seconds |

## Error Handling

```go
result, err := client.Get(ctx, oid)
if err != nil {
    switch {
    case errors.Is(err, snmp.ErrTimeout):
        log.Println("Request timed out")
    case errors.Is(err, snmp.ErrNoSuchObject):
        log.Println("OID does not exist")
    case errors.Is(err, snmp.ErrNoSuchInstance):
        log.Println("Instance does not exist")
    case errors.Is(err, snmp.ErrAuthenticationFailure):
        log.Println("Authentication failed")
    default:
        log.Printf("Error: %v", err)
    }
}
```

## Next Steps

- Learn about the [Client API](client.md)
- Configure [Options](options.md)
- Use [Connection Pooling](pool.md)
- Set up [Trap Listener](trap.md)
- Try the [CLI Tool](cli.md)
