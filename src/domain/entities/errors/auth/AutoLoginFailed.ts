import { BusinessError } from "@domain/entities/errors/common";

class AutoLoginFailedError extends BusinessError {
  constructor() {
    super();
    this.name = "AutoLoginFailedError";
  }
}

export default AutoLoginFailedError;
