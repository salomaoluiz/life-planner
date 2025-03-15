import * as Crypto from "expo-crypto";

async function encode(data: Record<string, unknown>): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    JSON.stringify(data),
  );
}

export { encode };
