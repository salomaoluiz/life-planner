import CategoryModel from "@data/models/financial/CategoryModel";
import { CategoryDatasource } from "@data/repositories/repos/financial/categories/categoryDatasource";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { supabase } from "@infrastructure/supabase";

export type Params = Parameters<CategoryDatasource["getCategories"]>[0];

async function getCategories(ownerIds: Params) {
  try {
    const transactions = await supabase
      .from("financial_categories")
      .select()
      .in("owner_id", ownerIds)
      .then();

    if (!transactions.data) {
      throw new Error("Category without data");
    }

    return transactions.data.map<CategoryModel>((transaction) =>
      CategoryModel.fromJSON(transaction),
    );
  } catch (error) {
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
