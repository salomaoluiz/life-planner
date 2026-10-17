import BusinessError from "@domain/entities/errors/common/BusinessError";

// The API answers 422 when a purchase or plan with refunds is deleted.
class HasRefunds extends BusinessError {
  constructor() {
    super();
    this.name = "HasRefunds";
  }
}

export default HasRefunds;
