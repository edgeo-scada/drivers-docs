# Connection Pool Example

This example demonstrates using the connection pool for high-throughput applications.

## Basic Pool Usage

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
    // Create pool with 10 connections
    pool := s7.NewPool(
        "192.168.1.10",
        s7.WithPoolSize(10),
        s7.WithPoolMaxIdleTime(5*time.Minute),
        s7.WithPoolHealthCheckFrequency(30*time.Second),
        // Client options applied to each connection
        s7.WithRack(0),
        s7.WithSlot(1),
        s7.WithTimeout(5*time.Second),
    )

    ctx := context.Background()

    // Start the pool
    if err := pool.Start(ctx); err != nil {
        log.Fatalf("Pool start failed: %v", err)
    }
    defer pool.Close()

    log.Println("Connection pool started")

    // Use the pool for concurrent operations
    runConcurrentReads(ctx, pool)
}

func runConcurrentReads(ctx context.Context, pool *s7.Pool) {
    var wg sync.WaitGroup
    numWorkers := 50

    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func(workerID int) {
            defer wg.Done()

            // Execute operation with automatic connection return
            err := pool.Execute(ctx, func(client *s7.Client) error {
                data, err := client.ReadDB(ctx, 1, 0, 10)
                if err != nil {
                    return err
                }
                log.Printf("Worker %d: read %d bytes", workerID, len(data))
                return nil
            })

            if err != nil {
                log.Printf("Worker %d error: %v", workerID, err)
            }
        }(i)
    }

    wg.Wait()
    log.Println("All workers completed")
}
```

## Manual Connection Management

```go
func manualConnectionManagement(ctx context.Context, pool *s7.Pool) {
    // Get connection from pool
    client, err := pool.Get(ctx)
    if err != nil {
        log.Fatalf("Failed to get connection: %v", err)
    }

    // Make sure to return the connection
    defer pool.Put(client)

    // Use the connection
    data, err := client.ReadDB(ctx, 1, 0, 10)
    if err != nil {
        log.Printf("Read error: %v", err)
        return
    }

    log.Printf("Data: %v", data)
}
```

## Monitoring Pool Statistics

```go
func monitorPool(pool *s7.Pool, interval time.Duration) {
    ticker := time.NewTicker(interval)
    defer ticker.Stop()

    for range ticker.C {
        stats := pool.Stats()
        log.Printf("[POOL] total=%d available=%d in_use=%d health_failures=%d",
            stats.TotalConnections,
            stats.Available,
            stats.InUse,
            stats.HealthCheckFailures)
    }
}

// Usage
go monitorPool(pool, 10*time.Second)
```

## High-Throughput Data Collection

```go
package main

import (
    "context"
    "encoding/json"
    "log"
    "sync"
    "time"

    "github.com/edgeo/drivers/s7/s7"
)

type SensorReading struct {
    Timestamp   time.Time `json:"timestamp"`
    Temperature float32   `json:"temperature"`
    Pressure    float32   `json:"pressure"`
    FlowRate    float32   `json:"flow_rate"`
}

func main() {
    pool := s7.NewPool(
        "192.168.1.10",
        s7.WithPoolSize(5),
        s7.WithRack(0),
        s7.WithSlot(1),
    )

    ctx := context.Background()
    if err := pool.Start(ctx); err != nil {
        log.Fatal(err)
    }
    defer pool.Close()

    // Collect data from multiple sensors concurrently
    readings := collectSensorData(ctx, pool, 10)

    // Output results
    for _, reading := range readings {
        data, _ := json.Marshal(reading)
        log.Println(string(data))
    }
}

func collectSensorData(ctx context.Context, pool *s7.Pool, numSensors int) []SensorReading {
    var mu sync.Mutex
    var wg sync.WaitGroup
    readings := make([]SensorReading, 0, numSensors)

    for i := 0; i < numSensors; i++ {
        wg.Add(1)
        go func(sensorID int) {
            defer wg.Done()

            err := pool.Execute(ctx, func(client *s7.Client) error {
                // Each sensor has data in a different DB
                dbNum := sensorID + 1

                // Read sensor values
                temp, _ := client.ReadFloat32(ctx, s7.AreaDB, dbNum, 0)
                pressure, _ := client.ReadFloat32(ctx, s7.AreaDB, dbNum, 4)
                flowRate, _ := client.ReadFloat32(ctx, s7.AreaDB, dbNum, 8)

                reading := SensorReading{
                    Timestamp:   time.Now(),
                    Temperature: temp,
                    Pressure:    pressure,
                    FlowRate:    flowRate,
                }

                mu.Lock()
                readings = append(readings, reading)
                mu.Unlock()

                return nil
            })

            if err != nil {
                log.Printf("Sensor %d error: %v", sensorID, err)
            }
        }(i)
    }

    wg.Wait()
    return readings
}
```

## Pool with Context Timeout

```go
func readWithPoolTimeout(pool *s7.Pool) {
    // Create context with timeout
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    err := pool.Execute(ctx, func(client *s7.Client) error {
        // Long-running operation
        for i := 0; i < 100; i++ {
            select {
            case <-ctx.Done():
                return ctx.Err()
            default:
                _, err := client.ReadDB(ctx, 1, 0, 10)
                if err != nil {
                    return err
                }
            }
        }
        return nil
    })

    if err != nil {
        log.Printf("Operation error: %v", err)
    }
}
```

## Best Practices

1. **Size appropriately**: Set pool size based on expected concurrent access
2. **Use Execute()**: Preferred over manual Get/Put for safety
3. **Monitor statistics**: Watch for connection issues
4. **Handle errors**: Pool will recreate failed connections
5. **Set idle timeout**: Prevent stale connections
