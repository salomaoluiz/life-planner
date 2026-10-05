import { renderHook } from "@tests";

import { lightTheme } from "@presentation/theme/provider";

import { useKitTheme } from "./useKitTheme";

it("SHOULD expose the 007 tokens through the adapter", () => {
  const { result } = renderHook(() => useKitTheme());

  expect(result.current.colors.accent).toBe(lightTheme.colors.accent);
  expect(result.current.spacing.md).toBe(16);
  expect(result.current.radius.full).toBe(999);
  expect(result.current.sizes.touchTarget).toBe(44);
  expect(result.current.typography.body.fontSize).toBe(15);
  expect(result.current.breakpoint).toBe("compact");
  expect(result.current.isDark).toBe(false);
});
