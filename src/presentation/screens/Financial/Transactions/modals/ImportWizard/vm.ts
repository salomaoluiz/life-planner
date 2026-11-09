// What the View (views/Wide.tsx) may import from the ViewModel file.
import useImportWizardViewModel from "./useImportWizardViewModel";

export type { ImportWizardParams } from "./useImportWizardViewModel";
export type ImportWizardVM = ReturnType<typeof useImportWizardViewModel>;
