import { CategoryDatasource } from "@data/repositories/repos/financial/categories/categoryDatasource";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<CategoryDatasource["updateCategory"]>[0];

async function updateCategory(params: Params): Promise<void> {
  try {
    const response = await supabase
      .from("financial_categories")
      .update({
        depth_level: params.depthLevel,
        icon: params.icon,
        icon_color: params.iconColor,
        name: params.name,
        owner: params.owner,
        owner_id: params.ownerId,
        parent_id: params.parentId,
        type: params.type,
      })
      .eq("id", params.id)
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
      datasource: "CategoryDatasource - updateCategory",
      error,
      params,
    });
    throw genericError;
  }
}

export default updateCategory;
