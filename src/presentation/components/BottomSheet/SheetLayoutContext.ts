import { createContext, useContext } from "react";

export interface SheetLayout {
  columns: 1 | 2;
}

const SheetLayoutContext = createContext<SheetLayout>({ columns: 1 });

export const SheetLayoutProvider = SheetLayoutContext.Provider;

export function useSheetLayout(): SheetLayout {
  return useContext(SheetLayoutContext);
}
