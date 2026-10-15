import { BusinessError } from "@domain/entities/errors/common";

class AccountEmailMismatchError extends BusinessError {
  constructor() {
    super();
    this.name = "AccountEmailMismatchError";
  }
}

export default AccountEmailMismatchError;
