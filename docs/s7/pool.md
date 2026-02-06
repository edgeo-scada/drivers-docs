# Connection Pool

The connection pool allows reusing S7 connections for better performance.

## Creation

```go
pool, err := s7.NewPool(addr string, opts ...PoolOption) (*Pool, error)
```

**Parameters:**
- `addr`: S7 PLC address
- `opts`: Pool configuration options

```go
pool, err := s7.NewPool("192.168.1.100:102",
    s7.WithSize(10),
    s7.WithMaxIdleTime(5*time.Minute),
    s7.WithHealthCheckFrequency(1*time.Minute),
    s7.WithClientOptions(
        s7.WithRack(0),
        s7.WithSlot(1),
        s7.WithTimeout(5*time.Second),
    ),
)
if err != nil {
    log.Fatal(err)
}
defer pool.Close()
```

## Manual Usage

### Get / Put

```go
// Get a connection
client, err := pool.Get(ctx)
if err != nil {
    log.Fatal(err)
}

// Use the connection
data, err := client.ReadDB(ctx, 1, 0, 10)

// IMPORTANT: Always return the connection to the pool
pool.Put(client)
```

### Recommended Pattern

```go
func readFromPLC(ctx context.Context, pool *s7.Pool) ([]byte, error) {
    client, err := pool.Get(ctx)
    if err != nil {
        return nil, err
    }
    defer pool.Put(client)

    return client.ReadDB(ctx, 1, 0, 10)
}
```

## Using Do

The `Do` method acquires a connection, executes a function, and returns the connection to the pool automatically:

```go
err := pool.Do(ctx, func(c *s7.Client) error {
    data, err := c.ReadDB(ctx, 1, 0, 10)
    if err != nil {
        return err
    }
    fmt.Printf("Data: %v\n", data)
    return nil
})
```

## Pool Direct Methods

The pool exposes methods that automatically manage connection acquisition and release:

```go
// Read DB
data, err := pool.ReadDB(ctx, 1, 0, 10)

// Write DB
err := pool.WriteDB(ctx, 1, 100, []byte{0x01, 0x02})

// Read inputs
inputs, err := pool.ReadInputs(ctx, 0, 4)

// Read outputs
outputs, err := pool.ReadOutputs(ctx, 0, 4)

// Write outputs
err := pool.WriteOutputs(ctx, 0, []byte{0xFF})

// Read markers
markers, err := pool.ReadMarkers(ctx, 0, 8)

// Write markers
err := pool.WriteMarkers(ctx, 0, []byte{0x55})
```

## Pool Options

| Option | Description | Default |
|--------|-------------|---------|
| `WithSize(n)` | Maximum pool size | 5 |
| `WithMaxIdleTime(d)` | Maximum idle time before closing a connection | 5 min |
| `WithHealthCheckFrequency(d)` | Health check frequency | 1 min |
| `WithClientOptions(opts...)` | Options for created clients | - |

```go
pool, _ := s7.NewPool("192.168.1.100:102",
    s7.WithSize(20),                           // 20 max connections
    s7.WithMaxIdleTime(10*time.Minute),        // Close after 10min of inactivity
    s7.WithHealthCheckFrequency(30*time.Second), // Check every 30s
    s7.WithClientOptions(
        s7.WithRack(0),
        s7.WithSlot(1),
        s7.WithTimeout(3*time.Second),
        s7.WithAutoReconnect(false),  // The pool manages reconnection
    ),
)
```

## Statistics

```go
size := pool.Size()           // Number of connections in the pool
available := pool.Available() // Available connections

fmt.Printf("Pool: %d/%d available\n", available, size)
```

## Closing

```go
err := pool.Close()
```

Closing the pool:
1. Stops the health checker
2. Closes all active connections
3. Waits for goroutines to finish

## Pool Behavior

### Getting a Connection

1. Attempts to get an available connection from the pool
2. Checks that the connection is valid (connected)
3. If no connection is available and `created < size`, creates a new connection
4. Otherwise, returns `ErrPoolExhausted`

### Returning a Connection

1. Marks the connection as available
2. Updates the last-used timestamp

### Health Check

The health checker periodically verifies:
- That connections are still active
- That connections have not been idle for too long (idle time)

Invalid connections are automatically closed and removed from the pool.

## Complete Example

```go
package main

import (
    "context"
    "fmt"
    "log"
    "sync"
    "time"

    "github.com/edgeo-scada/s7/s7"
)

func main() {
    pool, err := s7.NewPool("192.168.1.100:102",
        s7.WithSize(10),
        s7.WithClientOptions(
            s7.WithRack(0),
            s7.WithSlot(1),
        ),
    )
    if err != nil {
        log.Fatal(err)
    }
    defer pool.Close()

    ctx := context.Background()

    // Parallel reads
    var wg sync.WaitGroup
    for i := 0; i < 20; i++ {
        wg.Add(1)
        go func(dbNum uint16) {
            defer wg.Done()

            data, err := pool.ReadDB(ctx, dbNum, 0, 10)
            if err != nil {
                log.Printf("Error reading DB%d: %v\n", dbNum, err)
                return
            }
            fmt.Printf("DB%d: %v\n", dbNum, data)
        }(uint16(i%5 + 1))
    }
    wg.Wait()

    fmt.Printf("Pool: %d connections, %d available\n", pool.Size(), pool.Available())
}
```
