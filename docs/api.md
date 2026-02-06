---
slug: /api
sidebar_position: 14
---

# API Reference

Edgeo exposes a REST API under `/api` and a WebSocket endpoint at `/ws`. All endpoints (except auth) require a valid JWT token.

## Authentication

Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Obtain a token via `POST /api/auth/login`.

## Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, get JWT token |
| POST | `/api/auth/refresh` | Refresh JWT token |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user details |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| POST | `/api/users/:id/reset-password` | Reset password |
| GET | `/api/users/roles` | List available roles |

### Providers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/providers` | List providers |
| POST | `/api/providers` | Create provider |
| GET | `/api/providers/:id` | Get provider |
| PUT | `/api/providers/:id` | Update provider |
| DELETE | `/api/providers/:id` | Delete provider |

### Tags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/providers/:pid/tags` | List tags in provider |
| GET | `/api/providers/:pid/browse` | Browse folder tree |
| POST | `/api/providers/:pid/tags` | Create tag |
| GET | `/api/tags/:id` | Get tag details |
| PUT | `/api/tags/:id` | Update tag |
| PATCH | `/api/tags/:id/value` | Write tag value |
| DELETE | `/api/tags/:id` | Delete tag |
| GET | `/api/tags/:id/history` | Query history |
| GET | `/api/tags/:id/alarms` | Get tag alarms |

### Devices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/devices` | List devices |
| POST | `/api/devices` | Create device |
| GET | `/api/devices/:id` | Get device |
| PUT | `/api/devices/:id` | Update device |
| DELETE | `/api/devices/:id` | Delete device |
| POST | `/api/devices/:id/connect` | Connect |
| POST | `/api/devices/:id/disconnect` | Disconnect |
| POST | `/api/devices/:id/reconnect` | Reconnect |
| GET | `/api/devices/:id/mappings` | List tag mappings |
| POST | `/api/devices/:id/mappings` | Create mapping |
| PUT | `/api/devices/:id/mappings/:mid` | Update mapping |
| DELETE | `/api/devices/:id/mappings/:mid` | Delete mapping |
| POST | `/api/devices/:id/read` | Read tags |
| POST | `/api/devices/:id/write` | Write to device |
| POST | `/api/devices/:id/browse` | Browse address space |

### Alarms

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alarms/configs` | List alarm configs |
| POST | `/api/alarms/configs` | Create alarm |
| GET | `/api/alarms/configs/:id` | Get alarm config |
| PUT | `/api/alarms/configs/:id` | Update alarm |
| DELETE | `/api/alarms/configs/:id` | Delete alarm |
| GET | `/api/alarms/active` | Active alarms |
| GET | `/api/alarms/active/:id` | Get alarm instance |
| POST | `/api/alarms/active/:id/ack` | Acknowledge alarm |
| POST | `/api/alarms/ack-all` | Acknowledge all |
| GET | `/api/alarms/summary` | Summary by severity |
| GET | `/api/alarms/history` | Alarm history |

### Historians

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/historians` | List historians |
| POST | `/api/historians` | Create historian |
| GET | `/api/historians/:id` | Get historian |
| PUT | `/api/historians/:id` | Update historian |
| DELETE | `/api/historians/:id` | Delete historian |
| POST | `/api/historians/:id/test` | Test connection |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/channels` | List channels |
| POST | `/api/notifications/channels` | Create channel |
| GET | `/api/notifications/channels/:id` | Get channel |
| PUT | `/api/notifications/channels/:id` | Update channel |
| DELETE | `/api/notifications/channels/:id` | Delete channel |
| POST | `/api/notifications/channels/:id/test` | Test channel |
| GET | `/api/notifications/logs` | All logs |
| GET | `/api/notifications/logs/recent` | Recent logs |

### Gateways

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gateways` | List connections |
| POST | `/api/gateways` | Create connection |
| POST | `/api/gateways/test` | Test connection |
| POST | `/api/gateways/token` | Generate auth token |
| GET | `/api/gateways/incoming` | Incoming connections |
| POST | `/api/gateways/incoming/:gid/import` | Import from incoming |
| DELETE | `/api/gateways/incoming/:gid` | Disconnect incoming |
| GET | `/api/gateways/:id` | Get connection |
| PUT | `/api/gateways/:id` | Update connection |
| DELETE | `/api/gateways/:id` | Delete connection |
| POST | `/api/gateways/:id/connect` | Establish connection |
| POST | `/api/gateways/:id/disconnect` | Close connection |
| GET | `/api/gateways/:id/providers` | Remote providers |
| POST | `/api/gateways/:id/providers` | Import provider |
| GET | `/api/gateways/:id/remote-providers` | Sync status |
| DELETE | `/api/gateways/:id/remote-providers/:rpId` | Stop sync |

### Graphics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/graphics` | List graphics |
| POST | `/api/graphics` | Create graphic |
| GET | `/api/graphics/:id` | Get graphic |
| PUT | `/api/graphics/:id` | Update graphic |
| DELETE | `/api/graphics/:id` | Delete graphic |
| POST | `/api/graphics/:id/import` | Import SVG |
| GET | `/api/graphics/:id/export` | Export SVG |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/info` | System information |
| PUT | `/api/info` | Update system config |
| GET | `/api/protocols` | Available protocols |

## WebSocket

Connect to `/ws?token=<JWT_TOKEN>` for real-time updates.

### Message Types

| Type | Direction | Description |
|------|-----------|-------------|
| `tag_subscribe` | Client → Server | Subscribe to tag updates |
| `tag_unsubscribe` | Client → Server | Cancel subscription |
| `tag_update` | Server → Client | Tag value changed |
| `device_status` | Server → Client | Device connection status changed |
| `alarm_triggered` | Server → Client | Alarm condition met |
| `alarm_acknowledged` | Server → Client | Alarm acknowledged |
| `gateway_status` | Server → Client | Gateway connection status |
| `provider_imported` | Server → Client | Remote provider imported |
