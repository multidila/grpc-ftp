import * as grpc from "@grpc/grpc-js";
import * as fs from "fs";
import * as path from "path";
import { FileInfo, ListFilesResponse, DownloadFileRequest, FileChunk } from "./types";

export function createHandlers(serverDir: string, chunkSize: number) {
  async function listFiles(
    call: grpc.ServerUnaryCall<Record<string, never>, ListFilesResponse>,
    callback: grpc.sendUnaryData<ListFilesResponse>
  ): Promise<void> {
    try {
      const entries = await fs.promises.readdir(serverDir, { withFileTypes: true });
      const files: FileInfo[] = [];

      for (const entry of entries) {
        if (!entry.isFile()) continue;
        try {
          const fullPath: string = path.join(serverDir, entry.name);
          const stat: fs.Stats = await fs.promises.stat(fullPath);
          files.push({
            name: entry.name,
            size_bytes: String(stat.size),
            modified_at: stat.mtime.toISOString(),
          });
        } catch {
          // file was deleted between readdir and stat — skip it
        }
      }

      callback(null, { files });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: `Cannot read directory: ${(err as Error).message}`,
        name: "INTERNAL",
        details: "",
        metadata: new grpc.Metadata(),
      });
    }
  }

  function downloadFile(
    call: grpc.ServerWritableStream<DownloadFileRequest, FileChunk>
  ): void {
    const fileName: string = call.request.file_name;
    const filePath: string = path.join(serverDir, fileName);

    const resolvedPath: string = path.resolve(filePath);
    const resolvedDir: string = path.resolve(serverDir);
    if (!resolvedPath.startsWith(resolvedDir + path.sep) && resolvedPath !== resolvedDir) {
      call.emit("error", {
        code: grpc.status.INVALID_ARGUMENT,
        message: "Invalid file name",
      });
      return;
    }

    let stat: fs.Stats;
    try {
      stat = fs.statSync(filePath);
    } catch {
      call.emit("error", {
        code: grpc.status.NOT_FOUND,
        message: `File not found: ${fileName}`,
      });
      return;
    }

    if (!stat.isFile()) {
      call.emit("error", {
        code: grpc.status.NOT_FOUND,
        message: `File not found: ${fileName}`,
      });
      return;
    }

    const effectiveChunkSize: number = call.request.chunk_size_kb > 0
      ? call.request.chunk_size_kb * 1024
      : chunkSize;

    console.log(`Transferring file: ${fileName} (chunk size: ${effectiveChunkSize / 1024} KB)`);

    const stream: fs.ReadStream = fs.createReadStream(filePath, { highWaterMark: effectiveChunkSize });
    let offset: number = 0;

    stream.on("data", (chunk: Buffer) => {
      const canContinue: boolean = call.write({ data: chunk, offset });
      offset += chunk.length;
      if (!canContinue) {
        stream.pause();
      }
    });

    call.on("drain", () => {
      stream.resume();
    });

    stream.on("end", () => {
      console.log(`Transfer complete: ${fileName} (${offset} bytes)`);
      call.end();
    });

    stream.on("error", (err: Error) => {
      call.emit("error", {
        code: grpc.status.INTERNAL,
        message: `Read error: ${err.message}`,
      });
    });

    call.on("cancelled", () => {
      stream.destroy();
    });
  }

  return { ListFiles: listFiles, DownloadFile: downloadFile };
}
