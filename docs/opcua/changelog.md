---
sidebar_position: 10
---

# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-02-01

### Added

#### Client
- Complete OPC UA TCP client with session support
- Address space navigation (Browse, BrowseNext)
- Attribute reading (Read) with support for all data types
- Attribute writing (Write) with type validation
- Method calls (Call)
- Endpoint discovery (GetEndpoints)
- Automatic reconnection with exponential backoff
- Security policy support (None, Basic128Rsa15, Basic256, Basic256Sha256)
- Security mode support (None, Sign, SignAndEncrypt)
- Anonymous, password, and certificate authentication
- Built-in metrics (latency, counters, connections)
- Structured logging via slog

#### Subscriptions
- Subscription creation and deletion
- Monitored item creation
- Data change notification reception
- Publishing and sampling interval configuration

#### Server
- OPC UA TCP server with multi-client support
- Address space management
- Subscription and monitored item support
- Customizable authentication
- Node-level access control

#### Connection Pool
- Connection pool with automatic management
- Periodic health checks
- Statistics and metrics

#### CLI (opcuacli)
- `browse` command - Address space navigation
- `read` command - Node value reading
- `write` command - Value writing
- `subscribe` command - Change subscription
- `info` command - Server information
- `version` command - Version display

### Supported Data Types
- Boolean
- SByte, Byte
- Int16, UInt16
- Int32, UInt32
- Int64, UInt64
- Float, Double
- String
- DateTime
- GUID
- ByteString
- NodeID
- StatusCode
- QualifiedName
- LocalizedText

## [Unreleased]

### Planned
- HistoryRead and HistoryUpdate support
- RegisterNodes and UnregisterNodes support
- TranslateBrowsePathsToNodeIds support
- Improved alarm and event support
- Automatic discovery support (FindServers)
- Cluster mode with automatic failover
