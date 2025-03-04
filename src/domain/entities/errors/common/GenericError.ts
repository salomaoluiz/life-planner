import { DefaultError, ErrorCodes } from "./errors";

class GenericError extends DefaultError {
  constructor(message: string) {
    super({
      message: message,
      code: ErrorCodes.TechnicalError,
    });
    this.name = "GenericError";
  }
}

export default GenericError;
