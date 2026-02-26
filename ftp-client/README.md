# FTP Client (gRPC)

An interactive gRPC client that connects to an FTP server to browse and download files.

- **ListFiles** — fetches the file list from the server and displays it as a table
- **DownloadFile** — downloads a selected file via server-streaming RPC with progress indication

## Prerequisites

- Node.js >= 18
- npm
- A running [ftp-server](../ftp-server/) instance

## Setup

```bash
npm install
npm run build
```

## Usage

```bash
npm start
```

The client will connect to the server, display a file table, and present an interactive menu to select a file for download.

### CLI Options

| Option       | Alias | Description                       | Default            |
|-------------|-------|-----------------------------------|--------------------|
| `--server`     | `-s`  | Server address (host:port)                        | `localhost:50051`  |
| `--dir`        | `-d`  | Directory to save downloaded files                | `./downloads`     |
| `--chunk-size` | `-c`  | Chunk size in KB for file streaming (0 = server default) | `0`        |
| `--help`       | `-h`  | Show help                                         |                    |

### Examples

```bash
# Connect to localhost:50051, save to ./downloads
npm start

# Connect to a remote server
npm start -- --server 192.168.1.10:50051

# Custom download directory
npm start -- --dir /path/to/downloads --server 10.0.0.5:50051

# Short form
npm start -- -s 10.0.0.5:50051 -d /path/to/downloads

# Request 128 KB chunks from the server
npm start -- --chunk-size 128
```
