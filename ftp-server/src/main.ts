import * as grpc from "@grpc/grpc-js";
import * as fs from "fs";
import * as path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ftpProto } from "./proto";
import { createHandlers } from "./handlers";

const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 [options]")
  .option("port", {
    alias: "p",
    description: "Host and port to listen on",
    type: "string",
    default: "0.0.0.0:50051",
  })
  .option("dir", {
    alias: "d",
    description: "Directory with files to serve",
    type: "string",
    default: path.join(__dirname, "..", "server_files"),
  })
  .option("chunk-size", {
    alias: "c",
    description: "Chunk size in KB for file streaming",
    type: "number",
    default: 64,
  })
  .help()
  .alias("help", "h")
  .parseSync();

const SERVER_DIR: string = path.resolve(argv.dir);
const PORT: string = argv.port;
const CHUNK_SIZE: number = argv.chunkSize * 1024;

function main(): void {
  if (!fs.existsSync(SERVER_DIR)) {
    fs.mkdirSync(SERVER_DIR, { recursive: true });
  }

  const server = new grpc.Server();
  server.addService(ftpProto.FtpService.service, createHandlers(SERVER_DIR, CHUNK_SIZE));

  server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), (err: Error | null) => {
    if (err) {
      console.error("Failed to start:", err);
      process.exit(1);
    }
    console.log(`gRPC FTP server listening on ${PORT}`);
    console.log(`Serving files from: ${SERVER_DIR}`);
  });

  const shutdown = (): void => {
    console.log("\nShutting down...");
    server.tryShutdown((err) => {
      if (err) {
        console.error("Forced shutdown:", err);
        process.exit(1);
      }
      console.log("Server stopped.");
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();
