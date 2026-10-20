const sectionPickerTestIds = {
  option: (section: string) => `financial.layout.section-sheet-${section}`,
  sheet: "financial.layout.section-sheet",
} as const;

export default sectionPickerTestIds;
