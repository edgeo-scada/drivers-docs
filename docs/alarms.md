---
slug: /alarms
sidebar_position: 7
---

# Alarm Engine

The alarm engine monitors tag values in real time and triggers alarms when configured conditions are met. It supports deadband filtering, time delays, acknowledgment workflows, and notification dispatch.

## Alarm Flow

```
Tag Value Changes
       │
       ▼
  AlarmService evaluates conditions
       │
       ├─ Condition met (after delay) ──► Alarm Triggered
       │                                       │
       │                                       ├─► Notify (email, webhook, Slack, Telegram)
       │                                       ├─► WebSocket broadcast
       │                                       └─► History recorded
       │
       ├─ Condition cleared ──► Alarm Resolved
       │                              └─► History recorded
       │
       └─ User acknowledges ──► Alarm Acknowledged
                                       └─► History recorded
```

## Condition Types

| Type | Trigger Condition | Applicable Tag Types |
|------|-------------------|---------------------|
| `high` | Value > setpoint | int, float |
| `low` | Value < setpoint | int, float |
| `high_high` | Value > setpoint (critical) | int, float |
| `low_low` | Value < setpoint (critical) | int, float |
| `deviation` | \|Value - target\| > setpoint | int, float |
| `bool_true` | Value is `true` | bool |
| `bool_false` | Value is `false` | bool |
| `string_match` | Value matches string | string |
| `string_mismatch` | Value does not match string | string |

## Configuration

```json
POST /api/alarms/configs
{
  "tag_id": "<tag-uuid>",
  "name": "High Temperature",
  "description": "Reactor temperature too high",
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

### Parameters

| Parameter | Description |
|-----------|-------------|
| `condition_type` | Alarm trigger condition (see table above) |
| `setpoint` | Threshold value for numeric conditions |
| `setpoint_str` | Target string for string conditions |
| `target_value` | Reference value for deviation conditions |
| `deadband` | Hysteresis to prevent alarm chatter |
| `delay_seconds` | Condition must persist for this duration before triggering |
| `severity` | `low`, `medium`, `high`, `critical` |
| `message` | Notification message template (`{setpoint}` is substituted) |
| `notification_channel_ids` | Channels to notify when triggered |

### Deadband

The deadband prevents rapid toggling when a value oscillates around the setpoint. An alarm triggers when the value exceeds `setpoint`, but only clears when it drops below `setpoint - deadband`.

### Delay

The `delay_seconds` parameter requires the condition to remain true for the specified duration before the alarm triggers. This filters out transient spikes.

## Alarm States

An alarm instance tracks the runtime state of a configured alarm:

| State | Description |
|-------|-------------|
| **Triggered** | Condition is active |
| **Acknowledged** | Operator has acknowledged the alarm |
| **Resolved** | Condition has cleared |

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/alarms/configs` | List all alarm configurations |
| `POST /api/alarms/configs` | Create alarm |
| `PUT /api/alarms/configs/:id` | Update alarm |
| `DELETE /api/alarms/configs/:id` | Delete alarm |
| `GET /api/alarms/active` | List currently active alarms |
| `POST /api/alarms/active/:id/ack` | Acknowledge an alarm |
| `POST /api/alarms/ack-all` | Acknowledge all active alarms |
| `GET /api/alarms/summary` | Alarm count summary by severity |
| `GET /api/alarms/history` | Historical alarm events |

## Alarm History

Every state transition is recorded in the alarm history:

| Event Type | Description |
|------------|-------------|
| `triggered` | Alarm condition met |
| `acknowledged` | Operator acknowledged |
| `resolved` | Condition cleared |

Query history with filtering by time range, severity, and tag.
