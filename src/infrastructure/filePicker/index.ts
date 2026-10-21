import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

interface PickedFile {
  bytes: Uint8Array;
  name: string;
  size: number;
}

const CSV_TYPES = [
  "text/csv",
  "text/comma-separated-values",
  "text/plain",
  "application/vnd.ms-excel",
];

// E2E only (spec 047): the dev route `/e2e-csv` leaves a file here and the next pick returns it, because the browser
// file chooser cannot be driven by Maestro. Never set outside `__DEV__` with `EXPO_PUBLIC_E2E_LOGIN=true`.
let e2eFixture: PickedFile | undefined;

// `undefined` when the user cancels the picker.
async function pickCsvFile(): Promise<PickedFile | undefined> {
  if (e2eFixture) {
    const fixture = e2eFixture;

    e2eFixture = undefined;

    return fixture;
  }

  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    type: CSV_TYPES,
  });

  if (result.canceled || result.assets.length === 0) {
    return undefined;
  }

  const [asset] = result.assets;
  const bytes = await readBytes(asset);

  return { bytes, name: asset.name, size: asset.size ?? bytes.length };
}

async function readBytes(asset: DocumentPicker.DocumentPickerAsset) {
  if (Platform.OS === "web" && asset.file) {
    return new Uint8Array(await asset.file.arrayBuffer());
  }

  const base64 = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return Uint8Array.from(globalThis.atob(base64), (char) => char.charCodeAt(0));
}

function setE2eCsvFixture(file: PickedFile | undefined) {
  e2eFixture = file;
}

export type { PickedFile };
export { pickCsvFile, setE2eCsvFixture };
