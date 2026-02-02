# Basic Client Example

This example demonstrates GET, SET, and WALK operations with SNMP.

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
    )

    ctx := context.Background()

    // Connect
    if err := client.Connect(ctx); err != nil {
        log.Fatalf("Connection failed: %v", err)
    }
    defer client.Close()

    log.Println("Connected to SNMP agent")

    // Example 1: GET operations
    getOperations(ctx, client)

    // Example 2: WALK operations
    walkOperations(ctx, client)

    // Example 3: SET operations (uncomment if you have write access)
    // setOperations(ctx, client)
}

func getOperations(ctx context.Context, client *snmp.Client) {
    log.Println("\n=== GET Operations ===")

    // Get single OID
    result, err := client.Get(ctx, snmp.OIDSysDescr)
    if err != nil {
        log.Printf("Get error: %v", err)
    } else {
        log.Printf("System Description: %s", result[0].Value)
    }

    // Get multiple OIDs
    result, err = client.Get(ctx,
        snmp.OIDSysDescr,
        snmp.OIDSysName,
        snmp.OIDSysUpTime,
        snmp.OIDSysContact,
        snmp.OIDSysLocation,
    )
    if err != nil {
        log.Printf("Get error: %v", err)
        return
    }

    log.Println("\nSystem Information:")
    for _, vb := range result {
        log.Printf("  %s = %v", vb.OID, vb.Value)
    }

    // Parse uptime (in hundredths of seconds)
    if uptime, ok := result[2].Value.(uint32); ok {
        days := uptime / 8640000
        hours := (uptime % 8640000) / 360000
        minutes := (uptime % 360000) / 6000
        seconds := (uptime % 6000) / 100
        log.Printf("\nUptime: %d days %d:%02d:%02d", days, hours, minutes, seconds)
    }
}

func walkOperations(ctx context.Context, client *snmp.Client) {
    log.Println("\n=== WALK Operations ===")

    // Walk interface table
    log.Println("\nInterfaces:")
    err := client.WalkFunc(ctx, "1.3.6.1.2.1.2.2.1.2", func(vb snmp.VarBind) error {
        log.Printf("  %s", vb.Value)
        return nil
    })
    if err != nil {
        log.Printf("Walk error: %v", err)
    }

    // Get interface statistics using GetBulk
    log.Println("\nInterface Statistics (using GetBulk):")
    result, err := client.GetBulk(ctx, 0, 10,
        "1.3.6.1.2.1.2.2.1.2",  // ifDescr
        "1.3.6.1.2.1.2.2.1.10", // ifInOctets
        "1.3.6.1.2.1.2.2.1.16", // ifOutOctets
    )
    if err != nil {
        log.Printf("GetBulk error: %v", err)
        return
    }

    for _, vb := range result {
        log.Printf("  %s = %v", vb.OID, vb.Value)
    }
}

func setOperations(ctx context.Context, client *snmp.Client) {
    log.Println("\n=== SET Operations ===")

    // Set system contact
    err := client.Set(ctx, snmp.VarBind{
        OID:   snmp.OIDSysContact,
        Type:  snmp.TypeOctetString,
        Value: "admin@example.com",
    })
    if err != nil {
        log.Printf("Set error: %v", err)
        return
    }
    log.Println("Set sysContact to admin@example.com")

    // Verify the change
    result, err := client.Get(ctx, snmp.OIDSysContact)
    if err != nil {
        log.Printf("Get error: %v", err)
        return
    }
    log.Printf("Verified sysContact: %s", result[0].Value)
}
```

## Interface Monitoring

```go
func monitorInterfaces(ctx context.Context, client *snmp.Client, interval time.Duration) {
    ticker := time.NewTicker(interval)
    defer ticker.Stop()

    var lastIn, lastOut uint64
    first := true

    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            // Get interface counters
            result, err := client.Get(ctx,
                "1.3.6.1.2.1.2.2.1.10.1", // ifInOctets.1
                "1.3.6.1.2.1.2.2.1.16.1", // ifOutOctets.1
            )
            if err != nil {
                log.Printf("Error: %v", err)
                continue
            }

            inOctets := result[0].Value.(uint32)
            outOctets := result[1].Value.(uint32)

            if !first {
                inRate := (uint64(inOctets) - lastIn) / uint64(interval.Seconds())
                outRate := (uint64(outOctets) - lastOut) / uint64(interval.Seconds())
                log.Printf("Interface 1: In=%d B/s, Out=%d B/s", inRate, outRate)
            }

            lastIn = uint64(inOctets)
            lastOut = uint64(outOctets)
            first = false
        }
    }
}
```

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
        log.Println("Instance not found")
    default:
        log.Printf("Error: %v", err)
    }
}
```

## Custom OID Constants

```go
const (
    // Cisco-specific OIDs
    OIDCiscoMemoryPoolUsed  = "1.3.6.1.4.1.9.9.48.1.1.1.5.1"
    OIDCiscoMemoryPoolFree  = "1.3.6.1.4.1.9.9.48.1.1.1.6.1"
    OIDCiscoCPUTotal5min    = "1.3.6.1.4.1.9.9.109.1.1.1.1.8.1"

    // HP/HPE OIDs
    OIDHPICFCpuUtilization  = "1.3.6.1.4.1.11.2.14.11.5.1.9.6.1.0"
)

func getCiscoStats(ctx context.Context, client *snmp.Client) {
    result, err := client.Get(ctx,
        OIDCiscoMemoryPoolUsed,
        OIDCiscoMemoryPoolFree,
        OIDCiscoCPUTotal5min,
    )
    if err != nil {
        log.Printf("Error: %v", err)
        return
    }

    memUsed := result[0].Value.(uint32)
    memFree := result[1].Value.(uint32)
    cpu := result[2].Value.(uint32)

    log.Printf("Memory: Used=%d, Free=%d, Total=%d", memUsed, memFree, memUsed+memFree)
    log.Printf("CPU (5min avg): %d%%", cpu)
}
```
