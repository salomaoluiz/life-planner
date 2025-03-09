import { BusinessError } from "@domain/entities/errors/common";

class UserNotLogged extends BusinessError {
  constructor() {
    super();
    this.name = "UserNotLogged";
  }
}

export default UserNotLogged;
