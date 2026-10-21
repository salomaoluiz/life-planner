import { createContext, useContext } from "react";

export interface SheetLayout {
  columns: 1 | 2;
  // Spec 048: a fluid sheet does not scroll as a whole, its panes do.
  fluid?: boolean;
}

const SheetLayoutContext = createContext<SheetLayout>({ columns: 1 });

export const SheetLayoutProvider = SheetLayoutContext.Provider;

export function useSheetLayout(): SheetLayout {
  return useContext(SheetLayoutContext);
}
