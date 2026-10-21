import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

interface CsvFile {
  csv: string;
  name: string;
}

function downloadInBrowser(file: CsvFile) {
  const url = URL.createObjectURL(
    new Blob([file.csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");

  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Web: a download. Mobile: the file goes to the cache and the system share sheet opens with it.
async function saveCsvFile(file: CsvFile): Promise<void> {
  if (Platform.OS === "web") {
    downloadInBrowser(file);

    return;
  }

  const uri = `${FileSystem.cacheDirectory}${file.name}`;

  await FileSystem.writeAsStringAsync(uri, file.csv);
  await Sharing.shareAsync(uri, {
    dialogTitle: file.name,
    mimeType: "text/csv",
    UTI: "public.comma-separated-values-text",
  });
}

export type { CsvFile };
export { saveCsvFile };
