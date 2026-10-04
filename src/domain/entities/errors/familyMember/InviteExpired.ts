import BusinessError from "@domain/entities/errors/common/BusinessError";

class InviteExpired extends BusinessError {
  constructor() {
    super();
    this.name = "InviteExpired";
  }
}

export default InviteExpired;
