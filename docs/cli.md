---
slug: /cli
sidebar_position: 13
---

# CLI

The Edgeo CLI (`edgeo-cli`) is a command-line client for interacting with the Edgeo API. It supports tag browsing, value writing, alarm management, and real-time monitoring.

## Installation

Build from source:

```bash
make build-cli
```

The binary is output to `bin/edgeo-cli`.

## Global Flags

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--server` | `-s` | `http://localhost:8080` | Edgeo server URL |

## Authentication

```bash
# Login and save token locally
edgeo-cli auth login

# Logout (clear saved token)
edgeo-cli auth logout
```

## Providers

```bash
# List all providers
edgeo-cli providers list

# Get provider details
edgeo-cli providers get <provider-id>

# Create a provider
edgeo-cli providers create "Factory Line 1"

# Delete a provider
edgeo-cli providers delete <provider-id>
```

## Tags

```bash
# List tags in a provider
edgeo-cli tags list <provider-id>

# Browse tag hierarchy (folder tree)
edgeo-cli tags browse <provider-id> [path]

# Get tag details and current value
edgeo-cli tags get <tag-id>

# Write a value to a tag
edgeo-cli tags set <tag-id> 42.5

# Create a tag
edgeo-cli tags create <provider-id> "Temperature"

# Delete a tag
edgeo-cli tags delete <tag-id>
```

## Alarms

```bash
# List alarm configurations
edgeo-cli alarms list

# Get alarm details
edgeo-cli alarms get <alarm-id>

# List active (triggered) alarms
edgeo-cli alarms active

# Acknowledge an alarm
edgeo-cli alarms ack <alarm-instance-id>
```

## Historians

```bash
# List historians
edgeo-cli historians list

# Get historian details
edgeo-cli historians get <historian-id>

# Create a historian
edgeo-cli historians create "Local DB" postgres
```

## Notifications

```bash
# List notification channels
edgeo-cli notifications list

# Test a notification channel
edgeo-cli notifications test <channel-id>
```

## Real-Time Watch

Monitor tag value changes in real time via WebSocket:

```bash
# Watch all tags in a provider
edgeo-cli watch <provider-id>

# Watch tags under a specific path
edgeo-cli watch <provider-id> "Line1/Reactor"
```

The watch command connects to the WebSocket endpoint and prints tag updates as they arrive.
