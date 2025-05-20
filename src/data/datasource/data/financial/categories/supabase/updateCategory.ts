import { CategoryDatasource } from "@data/repositories/repos/financial/categories/categoryDatasource";
import { GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<CategoryDatasource["updateCategory"]>[0];

async function updateCategory(params: Params) {
  try {
    await supabase
      .from("financial_categories")
      .update({
        depth_level: params.depthLevel,
        icon: params.icon,
        name: params.name,
        owner: params.owner,
        owner_id: params.ownerId,
        parent_id: params.parentId,
      })
      .eq("id", params.id)
      .then();
  } catch (error) {
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "CategoryDatasource - updateCategory",
      error,
      params,
    });
    throw genericError;
  }
}

export default updateCategory;
