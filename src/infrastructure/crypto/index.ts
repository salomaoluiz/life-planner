import { Buffer } from "buffer";

async function decode<T>(encodedData: string): Promise<T> {
  return JSON.parse(Buffer.from(encodedData, "base64").toString("utf-8"));
}

async function encode(data: Record<string, unknown>): Promise<string> {
  return Buffer.from(JSON.stringify(data), "utf-8").toString("base64");
}

export { decode, encode };
