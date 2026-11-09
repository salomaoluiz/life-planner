import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import createTransferUseCase from "./createTransferUseCase";
import deleteTransferUseCase from "./deleteTransferUseCase";
import getTransferUseCase from "./getTransferUseCase";
import updateTransferUseCase from "./updateTransferUseCase";

const transfer = jest.mocked(repositoriesMocks.financialRepository.transfer);

beforeEach(() => {
  jest.clearAllMocks();
});

const createParams = {
  amountOut: "1000.00",
  dateOut: "2026-11-04T03:00:00.000Z",
  description: "Savings",
  fromAccountId: "account-1",
  paid: true,
  toAccountId: "account-2",
};

it("SHOULD create a transfer through the repository AND return its result", async () => {
  transfer.createTransfer.mockResolvedValueOnce({ rows: [] } as never);

  const result =
    await createTransferUseCase(repositoriesMocks).execute(createParams);

  expect(transfer.createTransfer).toHaveBeenCalledWith(createParams);
  expect(result).toEqual({ rows: [] });
});

it("SHOULD update a transfer with its scope", async () => {
  await updateTransferUseCase(repositoriesMocks).execute({
    amountOut: "50.00",
    id: "t1",
    scope: "THIS_AND_NEXT",
  });

  expect(transfer.updateTransfer).toHaveBeenCalledWith({
    amountOut: "50.00",
    id: "t1",
    scope: "THIS_AND_NEXT",
  });
});

it("SHOULD delete a transfer AND read one by id", async () => {
  await deleteTransferUseCase(repositoriesMocks).execute({
    id: "t1",
    scope: "ONLY_THIS",
  });
  await getTransferUseCase(repositoriesMocks).execute("t1");

  expect(transfer.deleteTransfer).toHaveBeenCalledWith({
    id: "t1",
    scope: "ONLY_THIS",
  });
  expect(transfer.getTransfer).toHaveBeenCalledWith("t1");
});

it.each([
  [
    "create",
    async () => createTransferUseCase(repositoriesMocks).execute(createParams),
    () => transfer.createTransfer,
  ],
  [
    "update",
    async () => updateTransferUseCase(repositoriesMocks).execute({ id: "t1" }),
    () => transfer.updateTransfer,
  ],
  [
    "delete",
    async () => deleteTransferUseCase(repositoriesMocks).execute({ id: "t1" }),
    () => transfer.deleteTransfer,
  ],
  [
    "get",
    async () => getTransferUseCase(repositoriesMocks).execute("t1"),
    () => transfer.getTransfer,
  ],
])(
  "SHOULD add the %s use case to a business error AND rethrow it",
  async (name, run, spy) => {
    spy().mockRejectedValueOnce(new BusinessError());

    const error = await run().catch((err: unknown) => err);

    expect(error).toBeInstanceOf(BusinessError);
    expect((error as BusinessError).context).toMatchObject({
      useCase: `financial.${name}TransferUseCase`,
    });
  },
);

it("SHOULD rethrow an error that is not a DefaultError untouched", async () => {
  const plain = new Error("boom");

  transfer.getTransfer.mockRejectedValueOnce(plain);

  await expect(
    getTransferUseCase(repositoriesMocks).execute("t1"),
  ).rejects.toBe(plain);
});
