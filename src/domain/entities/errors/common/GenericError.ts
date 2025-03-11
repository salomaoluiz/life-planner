import { DefaultError, ErrorCodes } from "./errors";

class GenericError extends DefaultError {
  constructor() {
    super({
      code: ErrorCodes.TechnicalError,
    });
    this.name = "GenericError";
  }
}

export default GenericError;
