---
slug: /notifications
sidebar_position: 9
---

# Notifications

Notifications deliver alarm events to operators through configurable channels. When an alarm triggers, the notification service sends messages to all channels linked to that alarm.

## Channel Types

### Email

SMTP-based email delivery.

```json
{
  "name": "Operations Team",
  "type": "email",
  "enabled": true,
  "config": {
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "username": "alerts@company.com",
    "password": "app-password",
    "from": "scada@company.com",
    "to": ["op1@company.com", "op2@company.com"],
    "use_tls": true
  }
}
```

### Webhook

HTTP POST to any endpoint.

```json
{
  "name": "PagerDuty",
  "type": "webhook",
  "enabled": true,
  "config": {
    "url": "https://events.pagerduty.com/v2/enqueue",
    "method": "POST",
    "headers": {
      "Authorization": "Token token=xxx",
      "Content-Type": "application/json"
    }
  }
}
```

### Slack

Post to a Slack channel via webhook.

```json
{
  "name": "Slack Alerts",
  "type": "slack",
  "enabled": true,
  "config": {
    "webhook_url": "https://hooks.slack.com/services/T.../B.../xxx"
  }
}
```

### Telegram

Send messages via Telegram Bot API.

```json
{
  "name": "Telegram Alerts",
  "type": "telegram",
  "enabled": true,
  "config": {
    "bot_token": "123456:ABC-DEF...",
    "chat_id": "-1001234567890"
  }
}
```

## Linking Channels to Alarms

When creating or updating an alarm configuration, specify the channels to notify:

```json
{
  "notification_channel_ids": ["<channel-uuid-1>", "<channel-uuid-2>"]
}
```

## Testing

Test a channel without triggering an alarm:

```
POST /api/notifications/channels/:id/test
```

## Notification Logs

All notification attempts are logged with status tracking:

| Status | Description |
|--------|-------------|
| `pending` | Queued for delivery |
| `sent` | Successfully delivered |
| `failed` | Delivery failed |

```
GET /api/notifications/logs
GET /api/notifications/logs/recent
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/notifications/channels` | List channels |
| `POST /api/notifications/channels` | Create channel |
| `GET /api/notifications/channels/:id` | Get channel |
| `PUT /api/notifications/channels/:id` | Update channel |
| `DELETE /api/notifications/channels/:id` | Delete channel |
| `POST /api/notifications/channels/:id/test` | Test channel |
| `GET /api/notifications/logs` | All notification logs |
| `GET /api/notifications/logs/recent` | Recent notifications |
