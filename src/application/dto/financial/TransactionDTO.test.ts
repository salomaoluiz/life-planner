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

it("SHOULD carry the projected flag from the entity (spec 096)", () => {
  const entity = new TransactionEntity({
    ...mocks.defaultProps,
    owner: OwnerType.FAMILY,
    projected: true,
    type: TransactionType.EXPENSE,
  });

  expect(TransactionDTO.fromEntity(entity).projected).toBe(true);
  expect(
    TransactionDTO.fromEntity(
      new TransactionEntity({ ...entity, projected: undefined }),
    ).projected,
  ).toBe(false);
});

describe("transfer rows (spec 098)", () => {
  const transfer = {
    amountOut: "5000.00",
    counterpartHidden: false,
    currencyIn: "USD" as const,
    currencyOut: "BRL" as const,
    dateIn: "2026-11-06",
    dateOut: "2026-11-04",
    fromAccountId: "acc-1",
    toAccountId: "acc-2",
  };
  const accounts = [
    { id: "acc-1", name: "Checking" },
    { id: "acc-2", name: "Global" },
  ];

  function entity(systemKey: string, overrides = {}) {
    return new TransactionEntity({
      ...mocks.defaultProps,
      owner: OwnerType.USER,
      systemKey,
      transfer,
      transferId: "transfer-1",
      type: TransactionType.EXPENSE,
      ...overrides,
    } as never);
  }

  it("SHOULD carry the transfer ids AND name the destination of the out row and the origin of the in row", () => {
    const out = TransactionDTO.fromEntity(
      entity("TRANSFER_OUT"),
      undefined,
      undefined,
      accounts,
    );
    const incoming = TransactionDTO.fromEntity(
      entity("TRANSFER_IN"),
      undefined,
      undefined,
      accounts,
    );

    expect(out.transferId).toBe("transfer-1");
    expect(out.transfer).toEqual(transfer);
    expect(out.transferCounterpartName).toBe("Global");
    expect(incoming.transferCounterpartName).toBe("Checking");
  });

  it("SHOULD name nobody for the fee row, a hidden side, missing accounts or an unknown account", () => {
    expect(
      TransactionDTO.fromEntity(
        entity("TRANSFER_FEE"),
        undefined,
        undefined,
        accounts,
      ).transferCounterpartName,
    ).toBeUndefined();
    expect(
      TransactionDTO.fromEntity(
        entity("TRANSFER_OUT", {
          transfer: { ...transfer, counterpartHidden: true },
        }),
        undefined,
        undefined,
        accounts,
      ).transferCounterpartName,
    ).toBeUndefined();
    expect(
      TransactionDTO.fromEntity(entity("TRANSFER_OUT")).transferCounterpartName,
    ).toBeUndefined();
    expect(
      TransactionDTO.fromEntity(
        entity("TRANSFER_OUT"),
        undefined,
        undefined,
        [],
      ).transferCounterpartName,
    ).toBeUndefined();
    expect(
      TransactionDTO.fromEntity(
        new TransactionEntity({ ...mocks.defaultProps } as never),
        undefined,
        undefined,
        accounts,
      ).transferCounterpartName,
    ).toBeUndefined();
  });
});
