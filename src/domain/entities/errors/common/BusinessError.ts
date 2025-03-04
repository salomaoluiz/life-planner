import { DefaultError, ErrorCodes } from "./errors";

class BusinessError extends DefaultError {
  constructor(message: string) {
    super({
      message: message,
      code: ErrorCodes.BusinessError,
    });
    this.name = "BusinessError";
  }
}

export default BusinessError;
