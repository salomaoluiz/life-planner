import { BusinessError } from "@domain/entities/errors/common";

class FieldInvalid extends BusinessError {
  constructor(fields: Record<string, unknown>) {
    super();
    const fieldKey = Object.keys(fields);
    this.message = `The field ${fieldKey.join(",")} are invalid`;
    this.name = "FieldInvalid";
  }
}

export default FieldInvalid;
