import { act, renderHook } from "@testing-library/react-native";

import useCsvActions from "./useCsvActions";

describe("useCsvActions", () => {
  it("SHOULD open and close the overflow menu", () => {
    const { result } = renderHook(() => useCsvActions());

    act(() => result.current.onMenuOpen());
    expect(result.current.menuOpen).toBe(true);
    act(() => result.current.onMenuClose());
    expect(result.current.menuOpen).toBe(false);
  });

  it("SHOULD close the menu WHEN an action is chosen and open its sheet", () => {
    const { result } = renderHook(() => useCsvActions());

    act(() => result.current.onMenuOpen());
    act(() => result.current.onExportOpen());
    expect(result.current.menuOpen).toBe(false);
    expect(result.current.exportOpen).toBe(true);

    act(() => result.current.onExportClose());
    act(() => result.current.onMenuOpen());
    act(() => result.current.onImportOpen());
    expect(result.current.menuOpen).toBe(false);
    expect(result.current.importOpen).toBe(true);
    expect(result.current.exportOpen).toBe(false);
  });
});
