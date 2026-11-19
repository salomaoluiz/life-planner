type Module = "financial" | "investment" | "stock";

const sectionPickerTestIds = {
  option: (section: string, module: Module = "financial") =>
    `${module}.layout.section-sheet-${section}`,
  sheet: "financial.layout.section-sheet",
} as const;

export default sectionPickerTestIds;
