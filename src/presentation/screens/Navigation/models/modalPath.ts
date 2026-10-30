import { FINANCIAL_SECTIONS } from "@screens/Financial/Layout/models/financialSections";

export const MODAL_NAMES = [
  "add_new_transaction",
  "add_new_account",
  "add_new_credit_card",
  "add_new_category",
  "add_new_tag",
  "invoice_detail",
  "edit_installment",
  "prepay_installments",
  "card_refund",
  "card_early_payment",
  "section_picker",
  "add_new_stock_item",
  "add_new_family",
  "add_new_family_member",
  "invite",
  "quick_add",
  "business_feedback",
  "versions",
] as const;

export type ModalName = (typeof MODAL_NAMES)[number];

export interface ModalPathParts {
  base: string;
  modal: ModalName;
  rawBase: string;
}

const HOME = "/";

export const VALID_BASES: readonly string[] = [
  HOME,
  "/stock",
  "/family",
  "/settings",
  ...FINANCIAL_SECTIONS.map((section) => section.path),
];

export function buildModalPath(base: string, modal: ModalName): string {
  const normalized = normalizeBase(base);

  return normalized === HOME ? `/${modal}` : `${normalized}/${modal}`;
}

export function fallbackBase({
  modal,
  rawBase,
}: Pick<ModalPathParts, "modal" | "rawBase">): string {
  if (modal === "invite" && rawBase === HOME) {
    return "/family";
  }

  return isValidBase(rawBase) ? normalizeBase(rawBase) : HOME;
}

export function isModalName(value: string): value is ModalName {
  return (MODAL_NAMES as readonly string[]).includes(value);
}

export function isValidBase(base: string): boolean {
  return VALID_BASES.includes(normalizeBase(base));
}

export function splitModalPath(path: string): ModalPathParts | null {
  const pathname = path.split("?")[0].replace(/\/+$/, "");
  const index = pathname.lastIndexOf("/");
  const modal = pathname.slice(index + 1);

  if (!isModalName(modal)) {
    return null;
  }

  const rawBase = normalizeBase(pathname.slice(0, index));

  return { base: rawBase, modal, rawBase };
}

function normalizeBase(base: string): string {
  const trimmed = base.replace(/\/+$/, "");

  return trimmed === "" ? HOME : trimmed;
}
