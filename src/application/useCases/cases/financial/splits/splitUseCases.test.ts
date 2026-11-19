import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import createSplitUseCase from "./createSplitUseCase";
import deleteSplitUseCase from "./deleteSplitUseCase";
import getSplitUseCase from "./getSplitUseCase";
import updateSplitUseCase from "./updateSplitUseCase";

const split = jest.mocked(repositoriesMocks.financialRepository.split);

beforeEach(() => {
  jest.clearAllMocks();
});

const createParams = {
  accountId: "account-1",
  date: "2026-11-15T03:00:00.000Z",
  description: "Mercado",
  parts: [
    { categoryId: "cat-1", type: "EXPENSE" as const, value: "120.00" },
    {
      systemKey: "SPLIT_ADJUSTMENT" as const,
      type: "EXPENSE" as const,
      value: "-4.40",
    },
  ],
};

it("SHOULD create a split through the repository AND return its result", async () => {
  split.createSplit.mockResolvedValueOnce({ parts: [] } as never);

  const result =
    await createSplitUseCase(repositoriesMocks).execute(createParams);

  expect(split.createSplit).toHaveBeenCalledWith(createParams);
  expect(result).toEqual({ parts: [] });
});

it("SHOULD update a split, delete one AND read one by id", async () => {
  await updateSplitUseCase(repositoriesMocks).execute({ id: "s1", paid: true });
  await deleteSplitUseCase(repositoriesMocks).execute("s1");
  await getSplitUseCase(repositoriesMocks).execute("s1");

  expect(split.updateSplit).toHaveBeenCalledWith({ id: "s1", paid: true });
  expect(split.deleteSplit).toHaveBeenCalledWith("s1");
  expect(split.getSplit).toHaveBeenCalledWith("s1");
});

it.each([
  [
    "create",
    async () => createSplitUseCase(repositoriesMocks).execute(createParams),
    () => split.createSplit,
  ],
  [
    "update",
    async () => updateSplitUseCase(repositoriesMocks).execute({ id: "s1" }),
    () => split.updateSplit,
  ],
  [
    "delete",
    async () => deleteSplitUseCase(repositoriesMocks).execute("s1"),
    () => split.deleteSplit,
  ],
  [
    "get",
    async () => getSplitUseCase(repositoriesMocks).execute("s1"),
    () => split.getSplit,
  ],
])(
  "SHOULD add the %s use case to a business error AND rethrow it",
  async (name, run, spy) => {
    spy().mockRejectedValueOnce(new BusinessError());

    const error = await run().catch((err: unknown) => err);

    expect(error).toBeInstanceOf(BusinessError);
    expect((error as BusinessError).context).toMatchObject({
      useCase: `financial.${name}SplitUseCase`,
    });
  },
);

it("SHOULD rethrow an error that is not a DefaultError untouched", async () => {
  const plain = new Error("boom");

  split.getSplit.mockRejectedValueOnce(plain);

  await expect(getSplitUseCase(repositoriesMocks).execute("s1")).rejects.toBe(
    plain,
  );
});
