import { CategoryDatasource } from "@data/repositories/repos/financial/categories/categoryDatasource";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<CategoryDatasource["deleteCategory"]>[0];

async function deleteCategory(params: Params): Promise<void> {
  try {
    const response = await supabase
      .from("financial_categories")
      .delete()
      .eq("id", params.id)
      .eq("owner_id", params.ownerId)
      .then();

    if (response.error) {
      throw response.error;
    }
  } catch (error) {
    if (error instanceof BusinessError) {
      throw error;
    }
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "CategoryDatasource - deleteCategory",
      error,
      params,
    });
    throw genericError;
  }
}

export default deleteCategory;
