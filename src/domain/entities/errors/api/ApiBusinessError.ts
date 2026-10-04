import { BusinessError } from "@domain/entities/errors/common";

class ApiBusinessError extends BusinessError {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super();
    this.name = "ApiBusinessError";
    this.message = message;
    this.statusCode = statusCode;
  }
}

export default ApiBusinessError;
