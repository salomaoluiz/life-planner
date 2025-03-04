import { BusinessError } from "@domain/entities/errors/common";

class LoginCanceledError extends BusinessError {
  constructor() {
    super("Login canceled by user");
    this.name = "LoginCanceledError";
  }
}

export default LoginCanceledError;
