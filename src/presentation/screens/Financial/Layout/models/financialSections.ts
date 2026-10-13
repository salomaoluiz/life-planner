export type FinancialSection = "accounts" | "categories" | "transactions";

const SECTION_PATHS: Record<FinancialSection, string> = {
  accounts: "/financial/accounts",
  categories: "/financial/categories",
  transactions: "/financial",
};

export function getFinancialSection(pathname: string): FinancialSection {
  const normalized = pathname.replace(/\/+$/, "");

  if (normalized.endsWith("/financial/categories")) {
    return "categories";
  }
  if (normalized.endsWith("/financial/accounts")) {
    return "accounts";
  }

  return "transactions";
}

export function getFinancialSectionPath(section: FinancialSection): string {
  return SECTION_PATHS[section];
}
