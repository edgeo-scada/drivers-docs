---
slug: /configuration
sidebar_position: 4
---

# Configuration

Edgeo is configured through environment variables (or a `.env` file). Runtime configuration (devices, tags, alarms, etc.) is managed via the REST API or the web UI and stored in PostgreSQL.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `8080` | HTTP server port |
| `DATABASE_URL` | — | PostgreSQL connection string (required) |
| `JWT_SECRET` | — | Secret key for JWT token signing (required) |
| `JWT_EXPIRE_HOURS` | `24` | JWT token expiration in hours |
| `GATEWAY_NAME` | hostname | Unique identifier for this instance in gateway networking |
| `DEBUG` | — | Enable debug logging |
| `LOG_LEVEL` | `info` | Logging level (`debug`, `info`) |

### Example `.env` File

```bash
SERVER_PORT=8080
DATABASE_URL=postgresql://postgres:strong-password@localhost:5432/scada?sslmode=disable
JWT_SECRET=change-this-to-a-strong-secret
JWT_EXPIRE_HOURS=24
GATEWAY_NAME=plant-a
```

## Runtime Configuration

All runtime configuration is managed through the API and stored in PostgreSQL. Below are the key configurable entities.

### Providers

Providers are tag namespaces that group related data points together. A provider can be local or imported from a remote gateway.

```json
{
  "name": "Factory Line 1",
  "description": "Tags for production line 1"
}
```

### Tags

Tags represent individual data points organized in a folder hierarchy within a provider.

**Tag types:** `folder`, `int`, `float`, `string`, `bool`

**Tag quality:** `good`, `bad`, `unknown`

```json
{
  "name": "Temperature",
  "type": "float",
  "parent_id": "<folder-tag-uuid>",
  "properties": {
    "unit": "°C",
    "description": "Reactor temperature"
  },
  "history_enabled": true,
  "historian_id": "<historian-uuid>"
}
```

### Devices

Devices represent connections to industrial equipment via protocol drivers.

```json
{
  "name": "PLC Line 1",
  "protocol": "modbus-tcp",
  "config": {
    "host": "192.168.1.100",
    "port": 502,
    "slave_id": 1,
    "timeout": 5000,
    "byte_order": "big",
    "word_order": "high_low"
  },
  "enabled": true,
  "polling_enabled": true,
  "polling_interval": 1000
}
```

**Supported protocols:** `modbus-tcp`, `opcua`, `mqtt`, `s7`, `bacnet`, `snmp`

### Tag Mappings

Tag mappings link tags to device addresses, defining how values are read from and written to devices.

```json
{
  "device_id": "<device-uuid>",
  "tag_id": "<tag-uuid>",
  "address": "40001",
  "data_type": "uint16",
  "properties": {
    "scale": 0.1,
    "offset": 0
  },
  "read_write": "readwrite",
  "polling_group": "default",
  "enabled": true
}
```

**`read_write` modes:** `read`, `write`, `readwrite`

### Alarm Configurations

Alarms monitor tag values and trigger when conditions are met.

```json
{
  "tag_id": "<tag-uuid>",
  "name": "High Temperature",
  "enabled": true,
  "condition_type": "high",
  "setpoint": 80.0,
  "deadband": 2.0,
  "delay_seconds": 10,
  "severity": "critical",
  "message": "Temperature exceeded {setpoint}°C",
  "notification_channel_ids": ["<channel-uuid>"]
}
```

**Condition types:**

| Type | Description |
|------|-------------|
| `high` | Value above setpoint |
| `low` | Value below setpoint |
| `high_high` | Value above critical setpoint |
| `low_low` | Value below critical setpoint |
| `deviation` | Value deviates from target by more than setpoint |
| `bool_true` | Boolean tag is `true` |
| `bool_false` | Boolean tag is `false` |
| `string_match` | String tag matches value |
| `string_mismatch` | String tag does not match value |

**Severity levels:** `low`, `medium`, `high`, `critical`

### Notification Channels

Channels define how alarm notifications are delivered.

**Email:**
```json
{
  "name": "Operations Team",
  "type": "email",
  "enabled": true,
  "config": {
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "username": "alerts@company.com",
    "password": "***",
    "from": "scada@company.com",
    "to": ["op1@company.com", "op2@company.com"],
    "use_tls": true
  }
}
```

**Webhook:**
```json
{
  "name": "PagerDuty",
  "type": "webhook",
  "enabled": true,
  "config": {
    "url": "https://events.pagerduty.com/v2/enqueue",
    "method": "POST",
    "headers": {"Authorization": "Token token=xxx"}
  }
}
```

**Supported types:** `email`, `webhook`, `slack`, `telegram`

### Historians

Historians configure where time-series data is stored.

**PostgreSQL backend:**
```json
{
  "name": "Local PostgreSQL",
  "type": "postgres",
  "enabled": true,
  "connection_string": "postgresql://postgres:pass@localhost:5432/scada?sslmode=disable",
  "retention_days": 365
}
```

**InfluxDB backend:**
```json
{
  "name": "InfluxDB",
  "type": "influxdb",
  "enabled": true,
  "connection_string": "http://influxdb:8086",
  "organization": "edgeo",
  "bucket": "scada",
  "retention_days": 90
}
```

### Gateway Connections

Connect to remote Edgeo instances for provider synchronization.

```json
{
  "name": "Remote Plant B",
  "remote_url": "ws://plant-b.local:8080/ws",
  "auth_token": "<generated-token>",
  "allow_write": false,
  "enabled": true
}
```

## Next Steps

- [Devices](/devices) — Device connection management
- [Alarms](/alarms) — Alarm engine details
- [Historian](/historian) — Time-series storage
- [API Reference](/api) — Full REST API documentation
