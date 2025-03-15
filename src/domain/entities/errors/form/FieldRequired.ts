import { BusinessError } from "@domain/entities/errors/common";

class FieldRequired extends BusinessError {
  constructor(fields: Record<string, unknown>) {
    super();
    const unfilledFields = this.getUnfilledFields(fields);
    this.message = `Fields ${unfilledFields.join(",")} are required`;
    this.name = "FieldRequired";
  }

  getUnfilledFields(fields: Record<string, unknown>) {
    return Object.entries(fields).reduce<string[]>((acc, [key, value]) => {
      if (!value) {
        acc.push(key);
      }
      return acc;
    }, []);
  }
}

export default FieldRequired;
