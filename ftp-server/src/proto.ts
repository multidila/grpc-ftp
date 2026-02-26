import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as path from "path";
import { FtpServiceDefinition } from "./types";

const PROTO_PATH: string = path.join(__dirname, "..", "proto", "ftp.proto");

const packageDef: protoLoader.PackageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

export const ftpProto = grpc.loadPackageDefinition(packageDef).ftp as unknown as FtpServiceDefinition;
