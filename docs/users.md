---
slug: /users
sidebar_position: 12
---

# Users & Access Control

Edgeo uses role-based access control (RBAC) with JWT authentication. Three roles provide different levels of access.

## Roles

### Admin

Full access to all platform features.

### Operator

Operational control — can read data, write tag values, acknowledge alarms, and interact with devices. Cannot manage users, create alarm configs, or modify notifications/historians.

### Viewer

Read-only access — can view tags, alarms, devices, and graphics but cannot modify anything.

## Permissions

| Resource | Admin | Operator | Viewer |
|----------|-------|----------|--------|
| Providers — create, update, delete | x | | |
| Providers — read | x | x | x |
| Tags — create, update, delete | x | | |
| Tags — read | x | x | x |
| Tags — write value | x | x | |
| Alarms — create, update, delete | x | | |
| Alarms — read | x | x | x |
| Alarms — acknowledge | x | x | |
| Notifications — manage | x | | |
| Notifications — read | x | x | x |
| Historians — manage | x | | |
| Historians — read | x | x | x |
| Users — manage | x | | |
| Users — read | x | x | |
| Devices — create, update, delete | x | | |
| Devices — read | x | x | x |
| Devices — write | x | x | |
| Graphics — manage | x | | |
| Graphics — read | x | x | x |
| Gateways — manage | x | | |

## Authentication

### Login

```json
POST /api/auth/login
{
  "email": "admin@localhost",
  "password": "admin1"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "admin@localhost",
    "role": "admin"
  }
}
```

### Using the Token

Include the JWT in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Token Refresh

```
POST /api/auth/refresh
Authorization: Bearer <current-token>
```

### Registration

```json
POST /api/auth/register
{
  "email": "operator@company.com",
  "password": "secure-password",
  "role": "operator"
}
```

## User Management (Admin)

| Endpoint | Description |
|----------|-------------|
| `GET /api/users` | List all users |
| `GET /api/users/:id` | Get user details |
| `POST /api/users` | Create user |
| `PUT /api/users/:id` | Update user |
| `DELETE /api/users/:id` | Delete user |
| `POST /api/users/:id/reset-password` | Reset user password |
| `GET /api/users/roles` | List available roles |

## Audit Logging

All user actions are logged in the `audit_logs` table:

| Field | Description |
|-------|-------------|
| `user_id` | User who performed the action |
| `action` | Action type (create, update, delete, etc.) |
| `resource_type` | Resource affected (tag, device, alarm, etc.) |
| `resource_id` | ID of the affected resource |
| `changes` | JSON diff of what changed |
| `created_at` | Timestamp |

## Default Admin

On first startup, if no admin user exists, Edgeo creates one:

| Field | Value |
|-------|-------|
| Email | `admin@localhost` |
| Password | `admin1` |

Change this password immediately after first login.
