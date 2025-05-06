import TransactionDTO from "@application/dto/financial/TransactionDTO";

import { mocks, setupFromEntity } from "./mocks/TransactionDTO.mocks";

it("SHOULD render correctly from entity", () => {
  const result = setupFromEntity();

  expect(result).toEqual(
    new TransactionDTO({
      category: mocks.defaultProps.category,
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
