import { OwnerType } from "@domain/entities/user/OwnerEntity";

// Spec 047: the file a CSV export produced.
export interface ExportFileEntity {
  csv: string;
  filename: string;
}

export type ExportFormat = "BR" | "INTL";

export type ExportOwnerScope = "ALL" | "FAMILY" | "USER";

// The export has its own query: it never follows the filters of the Transactions screen.
export interface ExportQuery {
  accountIds?: string[];
  creditCardIds?: string[];
  from: string;
  owner: ExportOwnerScope;
  ownerId?: string;
  to: string;
}

export interface ExportRequest extends ExportQuery {
  format: ExportFormat;
  lang: string;
}

// Spec 048 FR 24: an invoice the file touches, with the amount due once every row is applied.
export interface ImportInvoiceEntity {
  amountDue: number;
  creditCardId: string;
  invoiceMonth: string;
  paid: boolean;
}

export interface ImportRequest {
  owner: OwnerType;
  ownerId: string;
  rows: ImportRowEntity[];
}

// One row of `POST /transactions/import` (value in cents).
export interface ImportRowEntity {
  accountId?: string;
  categoryId: string;
  creditCardId?: string;
  currency?: string;
  date: string;
  description: string;
  // Spec 048: the invoice month (`YYYY-MM`) of a card row.
  invoiceMonth?: string;
  line: number;
  // The row's own owner (spec 047); the request's owner applies when absent.
  owner?: "FAMILY" | "USER";
  ownerId?: string;
  paid?: boolean;
  // Spec 048: the account an early payment or an invoice payment is paid from.
  paidFromAccountId?: string;
  tags?: string[];
  type: "EXPENSE" | "INCOME";
  value: number;
}

export interface ImportRowErrorEntity {
  code: string;
  line: number;
  message: string;
  // Spec 048: values the message needs (cents for amounts, `YYYY-MM` for months).
  params?: Record<string, number | string>;
}

export interface ImportValidationEntity {
  // Lines that look like transactions the owner already has.
  duplicates: number[];
  errors: ImportRowErrorEntity[];
  invoices: ImportInvoiceEntity[];
}
