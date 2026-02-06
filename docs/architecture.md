---
slug: /architecture
sidebar_position: 2
---

# Architecture

Edgeo is built as a layered Go application with a React frontend, backed by PostgreSQL for configuration and state, with pluggable time-series storage for historical data.

## Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                    │
│             REST API + WebSocket (real-time)                 │
└─────────────────────────┬────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│                   Fiber HTTP Server                          │
│            JWT Auth + RBAC Middleware                         │
├──────────────────────────────────────────────────────────────┤
│                     API Handlers                             │
│  Tags │ Alarms │ Devices │ Historians │ Gateway │ Graphics   │
├──────────────────────────────────────────────────────────────┤
│                    Services Layer                            │
│                                                              │
│  TagService ─────────► AlarmService ──► NotificationService  │
│       │                                                      │
│       ├──────────────► HistorianService                      │
│       │                                                      │
│       ├──────────────► WebSocket Hub (real-time broadcast)   │
│       │                                                      │
│       └──────────────► GatewayService (remote sync)          │
│                                                              │
│  ProtocolService ────► TagService (value updates)            │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                   Repository Layer (GORM)                    │
├──────────────────────────────────────────────────────────────┤
│                     PostgreSQL                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   Protocol Drivers                           │
│  Modbus TCP │ OPC UA │ MQTT │ S7 │ BACnet │ SNMP            │
└──────────────────────────┬───────────────────────────────────┘
                           │
              Industrial Devices / PLCs / Sensors
```

## Layers

### Frontend

React 18 SPA built with Vite and TypeScript. Uses Zustand for state management, Tanstack Query for server state, and Recharts for data visualization. The built frontend is embedded into the Go binary and served at `/`.

### API Layer

HTTP server built on [Fiber](https://gofiber.io/) with:
- JWT-based authentication (`/api/auth/*`)
- Role-based access control middleware (admin, operator, viewer)
- RESTful endpoints under `/api/*`
- WebSocket endpoint at `/ws` for real-time updates

### Services Layer

Business logic is organized into 10 services with explicit dependency injection:

| Service | Responsibility |
|---------|---------------|
| **AuthService** | User authentication, JWT token management |
| **UserService** | User CRUD, audit logging |
| **ProviderService** | Tag namespace management |
| **TagService** | Tag CRUD, hierarchical organization, value updates |
| **AlarmService** | Alarm configuration, condition evaluation, state machine |
| **NotificationService** | Channel management, alarm delivery (email, webhook, Slack, Telegram) |
| **HistorianService** | Time-series recording to PostgreSQL or InfluxDB |
| **ProtocolService** | Device connections, polling, tag read/write |
| **GatewayService** | Remote instance connections and provider synchronization |
| **SystemConfigService** | Global platform settings |

### Data Flow

**TagService** is the central hub. All value changes flow through it:

1. **ProtocolService** polls devices → writes values to **TagService**
2. **TagService** updates the tag value in the database
3. **TagService** notifies **AlarmService** → evaluates conditions → triggers **NotificationService**
4. **TagService** records to **HistorianService** (if history is enabled on the tag)
5. **TagService** broadcasts to **WebSocket Hub** → pushes to subscribed UI clients
6. **TagService** notifies **GatewayService** → syncs to connected remote instances

### Repository Layer

Data access via GORM with PostgreSQL. Each model has a dedicated repository with CRUD operations, filtering, and pagination.

### Protocol Drivers

Each protocol implements a common interface:

```go
type Protocol interface {
    Name() string
    DisplayName() string
    Version() string
    ConfigSchema() ConfigSchema
    Connect(ctx context.Context, config json.RawMessage) (Connection, error)
}

type Connection interface {
    Read(ctx context.Context, addresses []string) ([]ReadResult, error)
    Write(ctx context.Context, address string, value interface{}) error
    Subscribe(ctx context.Context, addresses []string, callback SubscriptionCallback) error
    Unsubscribe(ctx context.Context, addresses []string) error
    Status() ConnectionStatus
    Close() error
}
```

Drivers self-register via `init()` functions, making them available at runtime through a protocol registry.

### WebSocket Hub

Manages real-time bidirectional communication:

- **Tag subscriptions** — Clients subscribe to tag path patterns
- **Alarm events** — Triggered, acknowledged, resolved
- **Device status** — Connection state changes
- **Gateway events** — Remote instance status

### Gateway Networking

Edgeo instances can connect to each other via WebSocket:

- Outgoing connections to remote SCADA instances
- Incoming connections from other instances
- Provider import from remote gateways
- Bidirectional tag value synchronization
- Write-through to remote devices (configurable)

## Database Schema

PostgreSQL stores all configuration and runtime state across these tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts with roles (admin, operator, viewer) |
| `providers` | Tag namespaces (local or imported from remote gateways) |
| `tags` | Hierarchical data points with typed values and quality |
| `tag_histories` | Time-series historical values (PostgreSQL backend) |
| `tag_mappings` | Links between tags and device addresses |
| `devices` | Protocol connections with config and polling settings |
| `polling_groups` | Batch polling configuration per device |
| `alarm_configs` | Alarm rules (condition, setpoint, deadband, delay) |
| `alarm_instances` | Current alarm states |
| `alarm_histories` | Historical alarm events |
| `notification_channels` | Notification delivery channels |
| `notification_logs` | Notification delivery history |
| `gateway_connections` | Outgoing connections to remote instances |
| `remote_providers` | Imported provider sync state |
| `svg_graphics` | Synoptic SVG diagrams with tag bindings |
| `audit_logs` | User action history |
| `system_configs` | Global key-value settings |
