import * as path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { createFtpClient } from "./proto";
import { runCli } from "./cli";

const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 [options]")
  .option("server", {
    alias: "s",
    description: "Server address (host:port)",
    type: "string",
    default: "localhost:50051",
  })
  .option("dir", {
    alias: "d",
    description: "Directory to save downloaded files",
    type: "string",
    default: path.join(__dirname, "..", "downloads"),
  })
  .option("chunk-size", {
    alias: "c",
    description: "Chunk size in KB for file streaming (0 = use server default)",
    type: "number",
    default: 0,
  })
  .help()
  .alias("help", "h")
  .parseSync();

const SERVER_ADDR: string = argv.server;
const DOWNLOAD_DIR: string = path.resolve(argv.dir);
const CHUNK_SIZE_KB: number = argv.chunkSize;

const client = createFtpClient(SERVER_ADDR);
runCli(client, SERVER_ADDR, DOWNLOAD_DIR, CHUNK_SIZE_KB);
