import { BusinessError } from "@domain/entities/errors/common";

class ApiBusinessError extends BusinessError {
  // Numeric fields of the error body (counts), never free text: e.g. the paid occurrences of a delete (409).
  // The parsed error body, only read by datasources that map a specific conflict (never logged).
  body: Record<string, unknown>;
  details: Record<string, number>;
  statusCode: number;

  constructor(
    message: string,
    statusCode: number,
    details: Record<string, number> = {},
    body: Record<string, unknown> = {},
  ) {
    super();
    this.name = "ApiBusinessError";
    this.message = message;
    this.statusCode = statusCode;
    this.details = details;
    this.body = body;
  }
}

export default ApiBusinessError;
