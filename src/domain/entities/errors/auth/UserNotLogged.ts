import { BusinessError } from "@domain/entities/errors/common";

class UserNotLogged extends BusinessError {
  constructor() {
    super("User not logged");
    this.name = "UserNotLogged";
  }
}

export default UserNotLogged;
