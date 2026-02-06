---
slug: /historian
sidebar_position: 8
---

# Historian

The historian records tag values over time for trending, reporting, and analysis. Edgeo supports pluggable storage backends.

## Backends

### PostgreSQL

Stores historical values in a `tag_histories` table in the same PostgreSQL database. Simple to set up, suitable for moderate data volumes.

```json
POST /api/historians
{
  "name": "Local PostgreSQL",
  "type": "postgres",
  "enabled": true,
  "connection_string": "postgresql://postgres:pass@localhost:5432/scada?sslmode=disable",
  "retention_days": 365
}
```

### InfluxDB

Time-series optimized storage for high-frequency data collection. Better query performance and built-in retention policies.

```json
POST /api/historians
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

## Enabling History on Tags

To record history for a tag, set `history_enabled: true` and assign a `historian_id`:

```json
PUT /api/tags/:id
{
  "history_enabled": true,
  "historian_id": "<historian-uuid>"
}
```

When the TagService receives a value update for this tag, it writes the value, timestamp, and quality to the configured historian.

## Querying Historical Data

```
GET /api/tags/:id/history?start=2025-01-01T00:00:00Z&end=2025-01-02T00:00:00Z&limit=1000&order=asc
```

### Aggregation

For large time ranges, use aggregation to reduce the number of data points:

```
GET /api/tags/:id/history?start=...&end=...&aggregation=avg&interval=1h
```

**Aggregation functions:** `avg`, `min`, `max`, `sum`, `count`, `first`, `last`

**Interval examples:** `1m`, `5m`, `15m`, `1h`, `1d`

## Data Retention

Each historian has a `retention_days` setting. Data older than this threshold is periodically cleaned up.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/historians` | List historians |
| `POST /api/historians` | Create historian |
| `GET /api/historians/:id` | Get historian details |
| `PUT /api/historians/:id` | Update historian |
| `DELETE /api/historians/:id` | Delete historian |
| `POST /api/historians/:id/test` | Test connection |
| `GET /api/tags/:id/history` | Query tag history |
