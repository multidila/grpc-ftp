import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as path from "path";
import { FtpServiceDefinition, FtpServiceClient } from "./types";

const PROTO_PATH: string = path.join(__dirname, "..", "proto", "ftp.proto");

const packageDef: protoLoader.PackageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const ftpProto = grpc.loadPackageDefinition(packageDef).ftp as unknown as FtpServiceDefinition;

export function createFtpClient(address: string): FtpServiceClient {
  return new ftpProto.FtpService(address, grpc.credentials.createInsecure());
}
