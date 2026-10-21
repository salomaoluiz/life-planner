import BusinessError from "@domain/entities/errors/common/BusinessError";

export interface ImportRowErrorDetail {
  code: string;
  line: number;
  message: string;
}

// The API answers 422 with the rows it refused and writes nothing (spec 047).
class ImportRowsInvalid extends BusinessError {
  errors: ImportRowErrorDetail[];

  constructor(errors: ImportRowErrorDetail[]) {
    super();
    this.name = "ImportRowsInvalid";
    this.errors = errors;
  }
}

export default ImportRowsInvalid;
