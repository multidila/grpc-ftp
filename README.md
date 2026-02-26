# gRPC FTP

A gRPC-based file transfer application with separate client and server packages written in TypeScript. The client provides an interactive CLI for browsing and downloading files from the server.

## Protocol (gRPC)

The `FtpService` is defined in `proto/ftp.proto` and exposes two RPC methods:

| Method | Type | Description |
|---|---|---|
| `ListFiles` | Unary | Returns file metadata (name, size, modification time) |
| `DownloadFile` | Server-streaming | Streams file content in 64 KB chunks |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm

### Server

```bash
cd ftp-server
npm install
npm run build
npm start
```

By default the server listens on `0.0.0.0:50051` and serves files from `./server_files/`.

Options:

```bash
npm start -- --port 0.0.0.0:9090   # custom address/port
npm start -- --dir /path/to/files  # custom file directory
```

See [ftp-server/README.md](ftp-server/README.md) for more details.

### Client

```bash
cd ftp-client
npm install
npm run build
npm start
```

By default the client connects to `localhost:50051` and saves files to `./downloads/`.

Options:

```bash
npm start -- --server localhost:9090   # custom server address
npm start -- --dir /path/to/downloads  # custom download directory
```

See [ftp-client/README.md](ftp-client/README.md) for more details.

## Architecture

### Server

- **main.ts** — CLI arg parsing (yargs), gRPC server setup, graceful shutdown (SIGINT/SIGTERM)
- **handlers.ts** — RPC implementations: directory reading for `ListFiles`, chunked file streaming for `DownloadFile` with backpressure handling and path traversal protection
- **proto.ts** — dynamic proto loading via `@grpc/proto-loader`

### Client

- **main.ts** — CLI arg parsing, gRPC client creation, interactive CLI launch
- **cli.ts** — interactive menu using inquirer: file table display (cli-table3) and download selection
- **file-service.ts** — gRPC calls wrapped in Promises for async/await; `DownloadFile` writes chunks to disk with progress output
- **proto.ts** — dynamic proto loading and client stub instantiation
