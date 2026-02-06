---
slug: /installation
sidebar_position: 3
---

# Installation

## Prerequisites

- **Go 1.22+**
- **Node.js 20+** (for building the frontend)
- **PostgreSQL 16+**
- **Make**

## Docker Compose (recommended)

The fastest way to get started. Create a `.env` file and start both the application and database:

```bash
git clone https://github.com/edgeo-scada/edgeo.git
cd edgeo
```

Create a `.env` file:

```bash
SERVER_PORT=8080
DATABASE_URL=postgresql://postgres:strong-password@db:5432/scada?sslmode=disable
JWT_SECRET=change-this-to-a-strong-secret
JWT_EXPIRE_HOURS=24
```

Start the services:

```bash
docker compose up -d
```

This starts:
- **edgeo** on port `8080` (backend + embedded frontend)
- **PostgreSQL 16** on port `5432` with a health check

Open `http://localhost:8080` and log in with `admin@localhost` / `admin1`.

## From Source

### 1. Clone the repository

```bash
git clone https://github.com/edgeo-scada/edgeo.git
cd edgeo
```

### 2. Install dependencies

```bash
make deps
```

This installs Go modules, Node.js packages, and the `air` hot-reload tool.

### 3. Set up PostgreSQL

Create a database:

```bash
createdb scada
```

### 4. Configure environment

Create a `.env` file at the project root:

```bash
SERVER_PORT=8080
DATABASE_URL=postgresql://postgres:password@localhost:5432/scada?sslmode=disable
JWT_SECRET=change-this-to-a-strong-secret
JWT_EXPIRE_HOURS=24
```

### 5. Build and run

```bash
make build
make run
```

Or for development with hot reload:

```bash
# Terminal 1 — backend with hot reload
make dev-backend

# Terminal 2 — frontend with Vite dev server
make dev-frontend
```

## Build Targets

| Command | Description |
|---------|-------------|
| `make build` | Build frontend + backend + CLI |
| `make build-frontend` | Build frontend only |
| `make build-backend` | Build backend only (requires built frontend) |
| `make build-cli` | Build CLI only |
| `make run` | Build and run the server |
| `make dev-backend` | Backend with hot reload (air) |
| `make dev-frontend` | Frontend with Vite dev server |
| `make docker` | Build Docker image |
| `make docker-up` | Start Docker Compose |
| `make docker-down` | Stop Docker Compose |
| `make clean` | Remove build artifacts |

## Docker Build

Build the Docker image directly:

```bash
make docker
```

The Dockerfile uses a multi-stage build:
1. Build the frontend (Node.js)
2. Build the backend with embedded frontend (Go)
3. Package into an Alpine-based runtime image

## Alpine Deployment

For edge devices running Alpine Linux:

```bash
make package-alpine
```

This creates a `.tar.gz` archive containing:
- `edgeo` and `edgeo-cli` binaries
- OpenRC init scripts
- Configuration templates
- Install/uninstall scripts

## Test Utilities

| Command | Description |
|---------|-------------|
| `make seed` | Populate the database with test data |
| `make simulate` | Run a value simulator for test tags |
| `make modbus-server` | Start a Modbus TCP test server |
| `make pump-simulator` | Start a pump simulator (Modbus) |

## Verify

After starting, verify the server is running:

```bash
curl http://localhost:8080/api/info
```

## Next Steps

- [Configuration](/configuration) — Configure devices, tags, and alarms
- [Architecture](/architecture) — Understand the platform architecture
- [CLI](/cli) — Use the command-line client
