# FTP Server (gRPC)

A gRPC-based file server that exposes files from a directory over two RPCs:

- **ListFiles** (unary) — returns metadata (name, size, modification date) for all files in the served directory
- **DownloadFile** (server-streaming) — streams the requested file to the client in configurable chunks (default 64 KB)

## Prerequisites

- Node.js >= 18
- npm

## Setup

```bash
npm install
npm run build
```

## Usage

```bash
npm start
```

### CLI Options

| Option       | Alias | Description                  | Default           |
|-------------|-------|------------------------------|--------------------|
| `--port`       | `-p`  | Host and port to listen on          | `0.0.0.0:50051`   |
| `--dir`        | `-d`  | Directory with files to serve       | `./server_files`  |
| `--chunk-size` | `-c`  | Chunk size in KB for file streaming | `64`              |
| `--help`       | `-h`  | Show help                          |                    |

### Examples

```bash
# Start with defaults (port 50051, serving ./server_files)
npm start

# Serve files from a custom directory on a custom port
npm start -- --dir /path/to/files --port 0.0.0.0:9090

# Short form
npm start -- -d /path/to/files -p 0.0.0.0:9090

# Use 128 KB chunks for streaming
npm start -- --chunk-size 128
```

> **Note:** The client can also request a specific chunk size via the `chunk_size_kb` field in `DownloadFileRequest`. If the client sends a value greater than 0, it overrides the server's default.