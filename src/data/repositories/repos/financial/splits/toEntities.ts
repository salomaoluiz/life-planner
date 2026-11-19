import SplitModel from "@data/models/financial/SplitModel";
import SplitEntity, {
  SplitResultEntity,
  SplitUpdateResultEntity,
} from "@domain/entities/financial/SplitEntity";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import { toTransactionEntity } from "../transactions/getTransactions";
import { SplitResultModel, SplitUpdateResultModel } from "./splitDatasource";

function toSplitEntity(split: SplitModel): SplitEntity {
  return new SplitEntity({
    ...split,
    owner: OwnerType[split.owner],
    type: TransactionType[split.type],
  });
}

function toSplitResult(result: SplitResultModel): SplitResultEntity {
  return {
    parts: result.parts.map((part) => toTransactionEntity(part)),
    split: toSplitEntity(result.split),
  };
}

function toSplitUpdateResult(
  result: SplitUpdateResultModel,
): SplitUpdateResultEntity {
  return {
    dissolved: result.dissolved && toTransactionEntity(result.dissolved),
    result: result.result && toSplitResult(result.result),
  };
}

export { toSplitResult, toSplitUpdateResult };
