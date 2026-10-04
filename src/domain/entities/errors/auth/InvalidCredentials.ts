import { BusinessError } from "@domain/entities/errors/common";

class InvalidCredentialsError extends BusinessError {
  constructor() {
    super();
    this.name = "InvalidCredentialsError";
  }
}

export default InvalidCredentialsError;
