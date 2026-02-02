# Connection Pool

The S7 library includes a connection pool for high-throughput applications requiring concurrent PLC access.

## Overview

Connection pooling provides:
- Automatic connection management
- Concurrent access to PLCs
- Connection health monitoring
- Automatic reconnection for failed connections

## Creating a Pool

```go
package main

import (
    "context"
    "log"
    "time"

    "github.com/edgeo/drivers/s7/s7"
)

func main() {
    pool := s7.NewPool(
        "192.168.1.10",
        s7.WithPoolSize(5),
        s7.WithPoolMaxIdleTime(5*time.Minute),
        s7.WithPoolHealthCheckFrequency(1*time.Minute),
        // Client options
        s7.WithRack(0),
        s7.WithSlot(1),
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
s7.WithPoolSize(10) // 10 connections (default: 5)
```

### WithPoolMaxIdleTime

Sets the maximum time a connection can remain idle before being closed.

```go
s7.WithPoolMaxIdleTime(10*time.Minute) // 10 minutes (default: 5 minutes)
```

### WithPoolHealthCheckFrequency

Sets how often connections are health-checked.

```go
s7.WithPoolHealthCheckFrequency(30*time.Second) // 30 seconds (default: 1 minute)
```

## Using the Pool

### Get and Return Connections

```go
// Get a connection from the pool
client, err := pool.Get(ctx)
if err != nil {
    log.Fatal(err)
}

// Use the connection
data, err := client.ReadDB(ctx, 1, 0, 10)

// Return the connection to the pool
pool.Put(client)
```

### Execute with Automatic Return

```go
err := pool.Execute(ctx, func(client *s7.Client) error {
    // Connection is automatically returned after this function
    data, err := client.ReadDB(ctx, 1, 0, 10)
    if err != nil {
        return err
    }
    log.Printf("Data: %v", data)
    return nil
})
```

## Pool Statistics

```go
stats := pool.Stats()

log.Printf("Total connections: %d", stats.TotalConnections)
log.Printf("Available: %d", stats.Available)
log.Printf("In use: %d", stats.InUse)
log.Printf("Health check failures: %d", stats.HealthCheckFailures)
```

## Concurrent Access Example

```go
package main

import (
    "context"
    "log"
    "sync"
    "time"

    "github.com/edgeo/drivers/s7/s7"
)

func main() {
    pool := s7.NewPool(
        "192.168.1.10",
        s7.WithPoolSize(10),
        s7.WithRack(0),
        s7.WithSlot(1),
    )

    ctx := context.Background()
    if err := pool.Start(ctx); err != nil {
        log.Fatal(err)
    }
    defer pool.Close()

    // Simulate concurrent reads
    var wg sync.WaitGroup

    for i := 0; i < 100; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()

            err := pool.Execute(ctx, func(client *s7.Client) error {
                data, err := client.ReadDB(ctx, 1, 0, 10)
                if err != nil {
                    return err
                }
                log.Printf("Worker %d: %v", id, data)
                return nil
            })

            if err != nil {
                log.Printf("Worker %d error: %v", id, err)
            }
        }(i)
    }

    wg.Wait()
}
```

## Pool Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `WithPoolSize` | 5 | Number of connections in the pool |
| `WithPoolMaxIdleTime` | 5 min | Max idle time before connection cleanup |
| `WithPoolHealthCheckFrequency` | 1 min | Health check interval |

## Best Practices

1. **Size the pool appropriately** - Consider your concurrent access requirements
2. **Always return connections** - Use `Execute()` or ensure `Put()` is called
3. **Handle errors gracefully** - Pool will recreate failed connections
4. **Monitor statistics** - Watch for health check failures
5. **Set appropriate timeouts** - Balance between responsiveness and reliability
