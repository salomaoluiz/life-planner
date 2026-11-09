// What the View (views/Wide.tsx) may import from the ViewModel file.
import useExportModalViewModel from "./useExportModalViewModel";

export type { ExportModalParams } from "./useExportModalViewModel";
export type ExportModalVM = ReturnType<typeof useExportModalViewModel>;
