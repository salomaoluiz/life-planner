import CategoryModel from "@data/models/financial/CategoryModel";
import { CategoryDatasource } from "@data/repositories/repos/financial/categories/categoryDatasource";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<CategoryDatasource["getCategories"]>[0];

async function getCategories(ownerIds: Params) {
  try {
    const categories = await supabase
      .from("financial_categories")
      .select()
      .in("owner_id", ownerIds)
      .then();

    if (!categories.data) {
      throw new Error("Category without data");
    }

    return categories.data.map<CategoryModel>((transaction) =>
      CategoryModel.fromJSON(transaction),
    );
  } catch (error) {
    console.error({
      error,
      ownerIds,
      place: "datasource - getCategories",
    });
    if (error instanceof BusinessError) {
      throw error;
    }
    const genericError = new GenericError();
    genericError.addContext({
      datasource: "CategoryDatasource - getCategories",
      error,
      ownerIds,
    });
    throw genericError;
  }
}

export default getCategories;
