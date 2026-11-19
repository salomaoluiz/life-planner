import { SplitRefModel } from "@data/models/financial/TransactionModel";
import { SplitRefEntity } from "@domain/entities/financial/SplitEntity";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";

// The `type` of the model is the API string; the entity keeps the enum.
function toSplitRefEntity(ref?: SplitRefModel): SplitRefEntity | undefined {
  return ref && { ...ref, type: TransactionType[ref.type] };
}

export { toSplitRefEntity };
