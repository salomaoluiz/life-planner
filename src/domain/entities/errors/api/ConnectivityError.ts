import { BusinessError } from "@domain/entities/errors/common";

class ConnectivityError extends BusinessError {
  constructor() {
    super();
    this.name = "ConnectivityError";
  }
}

export default ConnectivityError;
