import CategoryModel from "@data/models/financial/CategoryModel";
import { CategoryDatasource } from "@data/repositories/repos/financial/categories/categoryDatasource";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<CategoryDatasource["createCategory"]>[0];

async function createCategory(params: Params): Promise<CategoryModel> {
  try {
    const response = await supabase
      .from("financial_categories")
      .upsert({
        depth_level: params.depthLevel,
        icon: params.icon,
        name: params.name,
        owner: params.owner,
        owner_id: params.ownerId,
        parent_id: params.parentId,
      })
      .select()
      .then();

    if (response.error) {
      throw response.error;
    }

    if (!response.data) {
      throw new Error("Without data response");
    }

    return CategoryModel.fromJSON(response.data[0]);
  } catch (error) {
    if (error instanceof BusinessError) {
      throw error;
    }
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "CategoryDatasource - createCategory",
      error,
      params,
    });

    throw genericError;
  }
}

export default createCategory;
