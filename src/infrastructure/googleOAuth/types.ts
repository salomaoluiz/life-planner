export enum SignInStatus {
  Success = "success",
  Canceled = "canceled",
  Error = "error",
}

interface SuccessSignIn {
  status: SignInStatus.Success;
  data: {
    token: string;
  };
}

interface FailureSignIn {
  status: SignInStatus.Error;
  error: Error;
}

interface CanceledSignIn {
  status: SignInStatus.Canceled;
}

export type SignInResult = SuccessSignIn | FailureSignIn | CanceledSignIn;
