---
slug: /gateway
sidebar_position: 10
---

# Gateway Networking

Edgeo instances can connect to each other via WebSocket to share tag providers and synchronize values in real time. This enables distributed SCADA architectures where multiple sites or zones are managed independently but monitored from a central location.

## Concepts

- **Outgoing connection** — This instance connects to a remote Edgeo instance
- **Incoming connection** — A remote instance connects to this one
- **Remote provider** — A provider imported from a remote instance, kept in sync
- **Write-through** — Optionally allow writing values back to the remote device

## Architecture

```
  ┌──────────────┐                    ┌──────────────┐
  │   Plant A    │◄── WebSocket ────► │   Plant B    │
  │   (Edgeo)   │                    │   (Edgeo)    │
  │              │  Provider sync     │              │
  │  Local tags  │◄─────────────────► │  Local tags  │
  └──────────────┘                    └──────────────┘
         │                                   │
    Local devices                      Local devices
```

## Setting Up a Connection

### 1. Generate an Auth Token

On the **remote** instance (the one being connected to):

```
POST /api/gateways/token
```

This returns a JWT token that the connecting instance will use to authenticate.

### 2. Create an Outgoing Connection

On the **local** instance:

```json
POST /api/gateways
{
  "name": "Plant B",
  "remote_url": "ws://plant-b.local:8080/ws",
  "auth_token": "<token-from-step-1>",
  "allow_write": false,
  "enabled": true
}
```

### 3. Connect

```
POST /api/gateways/:id/connect
```

### 4. Import Providers

List available remote providers:

```
GET /api/gateways/:id/providers
```

Import a provider (creates a local copy that stays in sync):

```json
POST /api/gateways/:id/providers
{
  "remote_provider_id": "<uuid>",
  "local_name": "Plant B - Line 1"
}
```

## Synchronization

Once a provider is imported:

1. The remote instance streams tag value updates via WebSocket
2. The GatewayService applies updates to the local copy of the provider
3. Local TagService processes updates (alarms, historian, UI)
4. If `allow_write` is enabled, writing to a remote tag sends the write back to the remote device

**Sync statuses:** `pending`, `syncing`, `synced`, `error`

## Incoming Connections

View and manage instances that have connected to this one:

```
GET /api/gateways/incoming
```

Import providers from incoming connections:

```
POST /api/gateways/incoming/:gatewayId/import
```

Disconnect an incoming gateway:

```
DELETE /api/gateways/incoming/:gatewayId
```

## Gateway Identification

Each Edgeo instance has a `GATEWAY_NAME` (defaults to hostname). This identifier is used in the gateway protocol to distinguish instances.

Set it in the `.env` file:

```bash
GATEWAY_NAME=plant-a
```

Or via the API:

```
PUT /api/info
{ "gateway_name": "plant-a" }
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/gateways` | List outgoing connections |
| `POST /api/gateways` | Create connection |
| `POST /api/gateways/test` | Test connection |
| `POST /api/gateways/token` | Generate auth token |
| `GET /api/gateways/incoming` | List incoming connections |
| `POST /api/gateways/incoming/:id/import` | Import from incoming |
| `DELETE /api/gateways/incoming/:id` | Disconnect incoming |
| `GET /api/gateways/:id` | Get connection details |
| `PUT /api/gateways/:id` | Update connection |
| `DELETE /api/gateways/:id` | Delete connection |
| `POST /api/gateways/:id/connect` | Establish connection |
| `POST /api/gateways/:id/disconnect` | Close connection |
| `GET /api/gateways/:id/providers` | List remote providers |
| `POST /api/gateways/:id/providers` | Import provider |
| `GET /api/gateways/:id/remote-providers` | Get sync status |
| `DELETE /api/gateways/:id/remote-providers/:rpId` | Stop sync |
