import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { saveCsvFile } from "./";

jest.mock("expo-file-system", () => ({
  cacheDirectory: "file:///cache/",
  writeAsStringAsync: jest.fn(),
}));
jest.mock("expo-sharing", () => ({ shareAsync: jest.fn() }));

const originalOS = Platform.OS;

afterEach(() => {
  Platform.OS = originalOS;
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

it("SHOULD write the file to the cache and open the share sheet on mobile", async () => {
  Platform.OS = "android";

  await saveCsvFile({ csv: "a;b", name: "transacoes.csv" });

  expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
    "file:///cache/transacoes.csv",
    "a;b",
  );
  expect(Sharing.shareAsync).toHaveBeenCalledWith(
    "file:///cache/transacoes.csv",
    expect.objectContaining({ mimeType: "text/csv" }),
  );
});

it("SHOULD download the file through a link on web", async () => {
  Platform.OS = "web";
  const click = jest.fn();
  const link = { click } as unknown as HTMLAnchorElement;
  const body = { appendChild: jest.fn(), removeChild: jest.fn() };

  global.URL.createObjectURL = jest.fn().mockReturnValue("blob:csv");
  global.URL.revokeObjectURL = jest.fn();
  Object.defineProperty(global, "document", {
    configurable: true,
    value: { body, createElement: jest.fn().mockReturnValue(link) },
  });

  await saveCsvFile({ csv: "a,b", name: "transactions.csv" });

  expect(link.download).toBe("transactions.csv");
  expect(link.href).toBe("blob:csv");
  expect(body.appendChild).toHaveBeenCalledWith(link);
  expect(click).toHaveBeenCalledTimes(1);
  expect(body.removeChild).toHaveBeenCalledWith(link);
  expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:csv");
  expect(FileSystem.writeAsStringAsync).not.toHaveBeenCalled();
});
