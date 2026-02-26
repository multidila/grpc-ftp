import * as grpc from "@grpc/grpc-js";

export interface FileInfo {
  name: string;
  size_bytes: string;
  modified_at: string;
}

export interface ListFilesResponse {
  files: FileInfo[];
}

export interface DownloadFileRequest {
  file_name: string;
  chunk_size_kb: number;
}

export interface FileChunk {
  data: Buffer;
  offset: number;
}

export interface FtpServiceClient extends grpc.Client {
  ListFiles(
    request: Record<string, never>,
    callback: (err: grpc.ServiceError | null, response: ListFilesResponse) => void
  ): void;
  DownloadFile(request: DownloadFileRequest): grpc.ClientReadableStream<FileChunk>;
}

export interface FtpServiceDefinition {
  FtpService: new (address: string, credentials: grpc.ChannelCredentials) => FtpServiceClient;
}
