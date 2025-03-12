export enum ErrorCodes {
  BusinessError = "BusinessError",
  TechnicalError = "TechnicalError",
}

export interface ErrorProps {
  code: ErrorCodes;
  context?: Record<string, unknown>;
}

abstract class DefaultError extends Error {
  code: ErrorCodes;
  context: Record<string, unknown> = {};

  protected constructor(props: ErrorProps) {
    super("Occurred an error");
    this.name = this.constructor.name;
    this.code = props.code;
  }

  addContext(context: Record<string, unknown>) {
    this.context = { ...this.context, ...context };
  }
}

export { DefaultError };
