import { AccountArchived, ApiBusinessError } from "@domain/entities/errors";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { api } from "@infrastructure/api";

import createTransaction from "./createTransaction";
import updateTransaction from "./updateTransaction";

jest.mock("@infrastructure/api", () => ({
  api: { patch: jest.fn(), post: jest.fn() },
}));

const create = {
  accountId: "c5598687-dfeb-485e-990a-a035d8e7d23d",
  category: "Food",
  categoryId: "7820cfbb-f1aa-4254-8e42-7a0fe1ee981f",
  date: new Date(2026, 9, 15).toISOString(),
  description: "Lunch",
  owner: OwnerType.USER,
  ownerId: "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d",
  type: "EXPENSE" as const,
  value: "10.00",
};

async function failure(run: () => Promise<unknown>) {
  try {
    await run();
  } catch (error) {
    return error;
  }
}

it("SHOULD map a 422 on create to AccountArchived", async () => {
  jest
    .mocked(api.post)
    .mockRejectedValueOnce(new ApiBusinessError("Unprocessable", 422));

  expect(await failure(async () => createTransaction(create))).toBeInstanceOf(
    AccountArchived,
  );
});

it("SHOULD map a 422 on update to AccountArchived", async () => {
  jest
    .mocked(api.patch)
    .mockRejectedValueOnce(new ApiBusinessError("Unprocessable", 422));

  expect(
    await failure(async () =>
      updateTransaction({ accountId: create.accountId, id: "t1" }),
    ),
  ).toBeInstanceOf(AccountArchived);
});
