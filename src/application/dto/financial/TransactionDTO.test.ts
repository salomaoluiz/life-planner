import TransactionDTO from "@application/dto/financial/TransactionDTO";
import TransactionEntity, {
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import { mocks, setupFromEntity } from "./mocks/TransactionDTO.mocks";

it("SHOULD render correctly from entity", () => {
  const result = setupFromEntity();

  expect(result).toEqual(
    new TransactionDTO({
      accountId: mocks.defaultProps.accountId,
      accountName: undefined,
      category: mocks.defaultProps.category,
      categoryId: mocks.defaultProps.categoryId,
      categoryName: undefined,
      date: mocks.defaultProps.date,
      description: mocks.defaultProps.description,
      id: mocks.defaultProps.id,
      owner: mocks.defaultProps.owner,
      ownerId: mocks.defaultProps.ownerId,
      type: mocks.defaultProps.type,
      value: mocks.defaultProps.value,
    }),
  );
});

it("SHOULD carry excludeFromTotals and systemKey from the entity", () => {
  const entity = new TransactionEntity({
    ...mocks.defaultProps,
    excludeFromTotals: true,
    owner: mocks.defaultProps.owner as OwnerType,
    systemKey: "BALANCE_ADJUSTMENT",
    type: mocks.defaultProps.type as TransactionType,
  });

  const result = TransactionDTO.fromEntity(entity);

  expect(result.excludeFromTotals).toBe(true);
  expect(result.systemKey).toBe("BALANCE_ADJUSTMENT");
  expect(setupFromEntity().excludeFromTotals).toBe(false);
});
