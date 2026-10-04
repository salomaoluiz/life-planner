import { BusinessError } from "@domain/entities/errors/common";

class EmailAlreadyInUseError extends BusinessError {
  constructor() {
    super();
    this.name = "EmailAlreadyInUseError";
  }
}

export default EmailAlreadyInUseError;
