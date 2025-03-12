import { BusinessError } from "@domain/entities/errors/common";

class LoginCanceledError extends BusinessError {
  constructor() {
    super();
    this.name = "LoginCanceledError";
  }
}

export default LoginCanceledError;
