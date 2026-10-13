import { lightTheme } from "@presentation/theme/provider";

import { getToneColors } from "./tones";

it("SHOULD map every tone to its soft background and strong foreground", () => {
  const tones = getToneColors(lightTheme.colors);

  expect(tones.accent).toEqual({
    background: lightTheme.colors.accentSoft,
    foreground: lightTheme.colors.accentText,
  });
  expect(tones.income).toEqual({
    background: lightTheme.colors.incomeSoft,
    foreground: lightTheme.colors.income,
  });
  expect(tones.expense.foreground).toBe(lightTheme.colors.expense);
  expect(tones.warning.background).toBe(lightTheme.colors.warningSoft);
  expect(tones.neutral).toEqual({
    background: lightTheme.colors.surfaceRaised,
    foreground: lightTheme.colors.textSecondary,
  });
});
