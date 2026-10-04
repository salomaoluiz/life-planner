import BusinessError from "@domain/entities/errors/common/BusinessError";

class InviteNotFound extends BusinessError {
  constructor() {
    super();
    this.name = "InviteNotFound";
  }
}

export default InviteNotFound;
