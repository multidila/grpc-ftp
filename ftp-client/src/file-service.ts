import * as grpc from "@grpc/grpc-js";
import * as fs from "fs";
import * as path from "path";
import prettyBytes from "pretty-bytes";
import { FileInfo, FileChunk, ListFilesResponse, FtpServiceClient } from "./types";

export function listFiles(client: FtpServiceClient): Promise<FileInfo[]> {
  return new Promise((resolve, reject) => {
    client.ListFiles({}, (err: grpc.ServiceError | null, response: ListFilesResponse) => {
      if (err) return reject(err);
      resolve(response.files);
    });
  });
}

export function downloadFile(
  client: FtpServiceClient,
  fileName: string,
  downloadDir: string,
  chunkSizeKb: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    const savePath: string = path.join(downloadDir, fileName);
    const writeStream: fs.WriteStream = fs.createWriteStream(savePath);
    const call: grpc.ClientReadableStream<FileChunk> = client.DownloadFile({ file_name: fileName, chunk_size_kb: chunkSizeKb });
    let received: number = 0;

    call.on("data", (chunk: FileChunk) => {
      writeStream.write(chunk.data);
      received += chunk.data.length;
      process.stdout.write(`\r  Received ${prettyBytes(received)}...`);
    });

    call.on("end", () => {
      writeStream.end();
      console.log(`\n  Saved to: ${savePath}`);
      resolve(savePath);
    });

    call.on("error", (err: Error) => {
      writeStream.destroy();
      fs.unlink(savePath, () => {});
      reject(err);
    });
  });
}
