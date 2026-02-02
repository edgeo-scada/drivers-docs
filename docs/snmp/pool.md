# Connection Pool

The SNMP library includes a connection pool for high-throughput monitoring applications.

## Overview

Connection pooling provides:
- Multiple concurrent connections to the same agent
- Load balancing across connections
- Automatic health checking
- Reconnection for failed connections

## Creating a Pool

```go
package main

import (
    "context"
    "log"
    "time"

    "github.com/edgeo/drivers/snmp/snmp"
)

func main() {
    pool := snmp.NewPool(
        snmp.WithPoolSize(3),
        snmp.WithPoolMaxIdleTime(5*time.Minute),
        snmp.WithPoolHealthCheckInterval(30*time.Second),
        // Client options applied to each connection
        snmp.WithTarget("192.168.1.1"),
        snmp.WithVersion(snmp.Version2c),
        snmp.WithCommunity("public"),
    )

    ctx := context.Background()
    if err := pool.Start(ctx); err != nil {
        log.Fatal(err)
    }
    defer pool.Close()
}
```

## Pool Options

### WithPoolSize

Sets the number of connections in the pool.

```go
snmp.WithPoolSize(5) // 5 connections (default: 3)
```

### WithPoolMaxIdleTime

Sets the maximum idle time before connection cleanup.

```go
snmp.WithPoolMaxIdleTime(5*time.Minute) // Default: 5 minutes
```

### WithPoolHealthCheckInterval

Sets the health check interval.

```go
snmp.WithPoolHealthCheckInterval(30*time.Second) // Default: 30 seconds
```

### WithPoolClientOptions

Applies client options to all pool connections.

```go
snmp.WithPoolClientOptions(
    snmp.WithTimeout(5*time.Second),
    snmp.WithRetries(2),
)
```

## Using the Pool

### Execute Operation

```go
// Execute with automatic connection selection
result, err := pool.Get(ctx, snmp.OIDSysDescr)
if err != nil {
    log.Fatal(err)
}
log.Printf("System: %s", result[0].Value)
```

### All Pool Methods

The pool exposes the same methods as the client:

```go
// GET
result, err := pool.Get(ctx, oid1, oid2)

// GETNEXT
result, err := pool.GetNext(ctx, oid)

// GETBULK
result, err := pool.GetBulk(ctx, 0, 10, oid)

// WALK
result, err := pool.Walk(ctx, rootOID)

// SET
err := pool.Set(ctx, varbind)
```

## Concurrent Monitoring Example

```go
package main

import (
    "context"
    "log"
    "sync"
    "time"

    "github.com/edgeo/drivers/snmp/snmp"
)

func main() {
    pool := snmp.NewPool(
        snmp.WithPoolSize(5),
        snmp.WithTarget("192.168.1.1"),
        snmp.WithVersion(snmp.Version2c),
        snmp.WithCommunity("public"),
    )

    ctx := context.Background()
    if err := pool.Start(ctx); err != nil {
        log.Fatal(err)
    }
    defer pool.Close()

    // Monitor multiple OIDs concurrently
    oids := []string{
        "1.3.6.1.2.1.2.2.1.10.1",  // ifInOctets.1
        "1.3.6.1.2.1.2.2.1.10.2",  // ifInOctets.2
        "1.3.6.1.2.1.2.2.1.16.1",  // ifOutOctets.1
        "1.3.6.1.2.1.2.2.1.16.2",  // ifOutOctets.2
    }

    var wg sync.WaitGroup
    results := make(chan snmp.VarBind, len(oids))

    for _, oid := range oids {
        wg.Add(1)
        go func(oid string) {
            defer wg.Done()

            result, err := pool.Get(ctx, oid)
            if err != nil {
                log.Printf("Error getting %s: %v", oid, err)
                return
            }

            results <- result[0]
        }(oid)
    }

    go func() {
        wg.Wait()
        close(results)
    }()

    for vb := range results {
        log.Printf("%s = %v", vb.OID, vb.Value)
    }
}
```

## Monitoring Multiple Devices

```go
package main

import (
    "context"
    "log"
    "sync"
    "time"

    "github.com/edgeo/drivers/snmp/snmp"
)

type DevicePool struct {
    Address string
    Pool    *snmp.Pool
}

func main() {
    ctx := context.Background()

    devices := []string{
        "192.168.1.1",
        "192.168.1.2",
        "192.168.1.3",
    }

    // Create pool for each device
    pools := make([]*DevicePool, len(devices))
    for i, addr := range devices {
        pool := snmp.NewPool(
            snmp.WithPoolSize(2),
            snmp.WithTarget(addr),
            snmp.WithVersion(snmp.Version2c),
            snmp.WithCommunity("public"),
        )

        if err := pool.Start(ctx); err != nil {
            log.Printf("Failed to start pool for %s: %v", addr, err)
            continue
        }

        pools[i] = &DevicePool{Address: addr, Pool: pool}
    }

    defer func() {
        for _, dp := range pools {
            if dp != nil && dp.Pool != nil {
                dp.Pool.Close()
            }
        }
    }()

    // Poll all devices
    var wg sync.WaitGroup
    for _, dp := range pools {
        if dp == nil {
            continue
        }

        wg.Add(1)
        go func(dp *DevicePool) {
            defer wg.Done()

            result, err := dp.Pool.Get(ctx, snmp.OIDSysUpTime)
            if err != nil {
                log.Printf("%s: error %v", dp.Address, err)
                return
            }

            log.Printf("%s: uptime = %v", dp.Address, result[0].Value)
        }(dp)
    }

    wg.Wait()
}
```

## Pool Statistics

```go
stats := pool.Stats()

log.Printf("Total connections: %d", stats.TotalConnections)
log.Printf("Available: %d", stats.Available)
log.Printf("In use: %d", stats.InUse)
log.Printf("Health check failures: %d", stats.HealthCheckFailures)
```

## Best Practices

1. **Size appropriately** - Set pool size based on expected concurrent operations
2. **Monitor health** - Watch for health check failures
3. **Set idle timeout** - Prevent stale connections
4. **Handle errors** - Pool will recreate failed connections
5. **Close properly** - Call `Close()` to clean up resources
