import { Datasources } from "@data/datasource";
import { BusinessError, GenericError } from "@domain/entities/errors";

async function deleteAccount(email: string, datasources: Datasources) {
  try {
    await datasources.userDatasource.deleteAccount(email);
  } catch (error) {
    if (error instanceof BusinessError) {
      throw error;
    }
    const genericError = new GenericError();
    // Context deliberately excludes the email.
    genericError.addContext({
      error,
      repository: "userRepositoryImpl - deleteAccount",
    });
    throw genericError;
  }
}

export default deleteAccount;
