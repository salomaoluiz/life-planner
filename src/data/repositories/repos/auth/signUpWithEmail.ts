import { Datasources } from "@data/datasource";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { SignUpWithEmailParams } from "@domain/repositories/auth";

async function signUpWithEmail(
  params: SignUpWithEmailParams,
  datasources: Datasources,
) {
  try {
    await datasources.loginDatasource.signUpWithEmail(params);
  } catch (error) {
    if (error instanceof BusinessError) {
      throw error;
    }
    const genericError = new GenericError();
    genericError.addContext({
      error,
      repository: "loginRepositoryImpl - signUpWithEmail",
    });
    throw genericError;
  }
}

export default signUpWithEmail;
