import BusinessError from "@domain/entities/errors/common/BusinessError";

class InviteEmailMismatch extends BusinessError {
  constructor() {
    super();
    this.name = "InviteEmailMismatch";
  }
}

export default InviteEmailMismatch;
