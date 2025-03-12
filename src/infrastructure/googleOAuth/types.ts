export enum SignInStatus {
  Canceled = "canceled",
  Error = "error",
  Success = "success",
}

export type SignInResult = CanceledSignIn | FailureSignIn | SuccessSignIn;

interface CanceledSignIn {
  status: SignInStatus.Canceled;
}

interface FailureSignIn {
  error: Error;
  status: SignInStatus.Error;
}

interface SuccessSignIn {
  data: {
    token: string;
  };
  status: SignInStatus.Success;
}
