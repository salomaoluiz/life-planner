import { DefaultError, ErrorCodes } from "./errors";

class BusinessError extends DefaultError {
  constructor() {
    super({
      code: ErrorCodes.BusinessError,
    });

    this.name = "BusinessError";
    this.message = "Occurred a business error";
  }
}

export default BusinessError;
