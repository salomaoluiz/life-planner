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
  line: number;
  // The row's own owner (spec 047); the request's owner applies when absent.
  owner?: "FAMILY" | "USER";
  ownerId?: string;
  paid?: boolean;
  tags?: string[];
  type: "EXPENSE" | "INCOME";
  value: number;
}

export interface ImportRowErrorEntity {
  code: string;
  line: number;
  message: string;
}

export interface ImportValidationEntity {
  // Lines that look like transactions the owner already has.
  duplicates: number[];
  errors: ImportRowErrorEntity[];
}
