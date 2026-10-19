import { BusinessError } from "@domain/entities/errors/common";

class ApiBusinessError extends BusinessError {
  // Numeric fields of the error body (counts), never free text: e.g. the paid occurrences of a delete (409).
  details: Record<string, number>;
  statusCode: number;

  constructor(
    message: string,
    statusCode: number,
    details: Record<string, number> = {},
  ) {
    super();
    this.name = "ApiBusinessError";
    this.message = message;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export default ApiBusinessError;
