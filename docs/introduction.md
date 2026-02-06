---
slug: /introduction
sidebar_position: 1
---

# Introduction

Edgeo is an open-source SCADA (Supervisory Control and Data Acquisition) platform for industrial automation. It provides a complete solution for collecting, storing, monitoring, and visualizing data from industrial devices and PLCs.

## Features

- **Multi-protocol drivers** — Modbus TCP, OPC UA, MQTT, S7, BACnet, SNMP
- **Real-time monitoring** — WebSocket-based live tag updates and alarm notifications
- **Hierarchical tag model** — Organize data points in folder trees by provider
- **Alarm engine** — Threshold, deviation, boolean, and string-match alarms with deadband and delay
- **Historian** — Time-series storage with PostgreSQL or InfluxDB backends
- **Notifications** — Email, webhook, Slack, and Telegram channels for alarm delivery
- **Gateway networking** — Connect multiple Edgeo instances together and sync providers remotely
- **SVG synoptic graphics** — Bind tag values to SVG elements for process visualization
- **Role-based access control** — Admin, operator, and viewer roles with granular permissions
- **CLI client** — Command-line tool for tag browsing, writing values, and real-time monitoring
- **Web UI** — React-based interface for configuration and monitoring

## Components

| Component | Description |
|-----------|-------------|
| **Backend** | Go server (Fiber) with REST API, WebSocket hub, and embedded frontend |
| **Frontend** | React + TypeScript SPA with Zustand state management |
| **CLI** | Cobra-based command-line client (`edgeo-cli`) |
| **Drivers** | Protocol-specific Go libraries for device communication |
| **Historian** | Pluggable time-series storage (PostgreSQL, InfluxDB) |
| **Alarm Engine** | Rule-based alarm evaluation, state machine, and notification dispatch |
| **Gateway** | WebSocket-based networking between Edgeo instances |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Web framework | [Fiber](https://gofiber.io/) |
| Database | PostgreSQL (via GORM) |
| Time-series | PostgreSQL or InfluxDB |
| Authentication | JWT (golang-jwt) |
| Frontend | React 18, TypeScript, Vite, Zustand, Tanstack Query, Recharts |
| CLI | Cobra |
| Real-time | WebSocket (gorilla/websocket) |

## Default Credentials

On first startup, an admin account is created automatically:

| Field | Value |
|-------|-------|
| Email | `admin@localhost` |
| Password | `admin1` |

## License

Edgeo is licensed under AGPL-3.0.

## Next Steps

- [Architecture](/architecture) — Understand how the components fit together
- [Installation](/installation) — Get Edgeo up and running
- [Configuration](/configuration) — Configure devices, tags, and alarms
- [Drivers](/drivers/) — Protocol driver documentation
- [API Reference](/api) — REST API and WebSocket reference
