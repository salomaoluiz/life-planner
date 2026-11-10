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
  "confirm_projected",
  "confirm_payment",
  "section_picker",
  "add_new_stock_item",
  "investment_asset",
  "investment_operation",
  "investment_valuation",
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

// A modal can open over the detail of an asset: `/investments/asset/<id>` (spec 102). The detail lives under `asset/` so that `/investments/<modal>` (a modal opened from the list) is never read as an asset id.
const INVESTMENT_DETAIL = /^\/investments\/asset\/[^/]+$/;

export const VALID_BASES: readonly string[] = [
  HOME,
  "/investments",
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
  const normalized = normalizeBase(base);

  return VALID_BASES.includes(normalized) || INVESTMENT_DETAIL.test(normalized);
}

// The path of the screen: the pathname itself, or the base WHEN a modal is open over it.
export function screenPath(pathname: string): string {
  return splitModalPath(pathname)?.rawBase ?? pathname;
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
