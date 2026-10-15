import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 422 when a transaction or an adjustment targets an archived account.
class AccountArchived extends BusinessError {
  constructor() {
    super();
    this.name = "AccountArchived";
  }
}

export default AccountArchived;
