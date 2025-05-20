import { CategoryDatasource } from "@data/repositories/repos/financial/categories/categoryDatasource";
import { GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<CategoryDatasource["deleteCategory"]>[0];

async function deleteCategory(params: Params) {
  try {
    await supabase
      .from("financial_categories")
      .delete()
      .eq("id", params.id)
      .eq("owner_id", params.ownerId)
      .then();
  } catch (error) {
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
