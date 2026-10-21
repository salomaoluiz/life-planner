import { useState } from "react";

// Which CSV sheet is open on the Transactions screen (spec 047): the overflow menu (mobile), the export modal and the
// import wizard. Choosing an action closes the menu first.
function useCsvActions() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  // Set after an import: the toast "N transactions imported" (spec 047 FR 32).
  const [importedCount, setImportedCount] = useState<number>();

  return {
    exportOpen,
    importedCount,
    importOpen,
    menuOpen,
    onExportClose: () => setExportOpen(false),
    onExportOpen: () => {
      setMenuOpen(false);
      setExportOpen(true);
    },
    onImportClose: () => setImportOpen(false),
    onImported: (count: number) => setImportedCount(count),
    onImportedHide: () => setImportedCount(undefined),
    onImportOpen: () => {
      setMenuOpen(false);
      setImportOpen(true);
    },
    onMenuClose: () => setMenuOpen(false),
    onMenuOpen: () => setMenuOpen(true),
  };
}

export default useCsvActions;
