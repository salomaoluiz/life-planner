export enum ErrorCodes {
  BusinessError = "BusinessError",
  TechnicalError = "TechnicalError",
}

interface DefaultErrorProps {
  message: string;
  code: ErrorCodes;
}

abstract class DefaultError extends Error {
  code: ErrorCodes;

  protected constructor(props: DefaultErrorProps) {
    super(props.message);
    this.name = this.constructor.name;
    this.code = props.code;
  }
}

export { DefaultError };
