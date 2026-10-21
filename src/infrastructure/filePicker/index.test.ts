import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

import { pickCsvFile } from "./";

jest.mock("expo-document-picker", () => ({ getDocumentAsync: jest.fn() }));
jest.mock("expo-file-system", () => ({
  EncodingType: { Base64: "base64" },
  readAsStringAsync: jest.fn(),
}));

const originalOS = Platform.OS;

afterEach(() => {
  Platform.OS = originalOS;
  jest.clearAllMocks();
});

it("SHOULD return undefined WHEN the user cancels", async () => {
  jest
    .mocked(DocumentPicker.getDocumentAsync)
    .mockResolvedValue({ assets: null, canceled: true });

  await expect(pickCsvFile()).resolves.toBeUndefined();
});

it("SHOULD read a native file as base64 bytes", async () => {
  Platform.OS = "ios";
  jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({
    assets: [{ name: "extrato.csv", size: 3, uri: "file:///extrato.csv" }],
    canceled: false,
  });
  jest.mocked(FileSystem.readAsStringAsync).mockResolvedValue("YWJj");

  const file = await pickCsvFile();

  expect(file).toEqual({
    bytes: new Uint8Array([97, 98, 99]),
    name: "extrato.csv",
    size: 3,
  });
});

it("SHOULD read a web file through its File object", async () => {
  Platform.OS = "web";
  const blob = { arrayBuffer: async () => new Uint8Array([97, 98]).buffer };
  jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValue({
    assets: [{ file: blob as unknown as File, name: "a.csv", uri: "blob:x" }],
    canceled: false,
  });

  const file = await pickCsvFile();

  expect(file?.bytes).toEqual(new Uint8Array([97, 98]));
  expect(file?.size).toBe(2);
});
