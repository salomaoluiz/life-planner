import InstallmentPlanDTO from "@application/dto/financial/InstallmentPlanDTO";
import {
  DefaultError,
  FieldInvalid,
  GenericError,
} from "@domain/entities/errors";
import InstallmentPlanEntity from "@domain/entities/financial/InstallmentPlanEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

import createInstallmentPlanUseCase from "./createInstallmentPlanUseCase";
import deleteInstallmentPlanUseCase from "./deleteInstallmentPlanUseCase";
import getInstallmentPlanUseCase from "./getInstallmentPlanUseCase";
import updateInstallmentPlanUseCase from "./updateInstallmentPlanUseCase";

const entity = new InstallmentPlanEntity({
  categoryId: "category-1",
  creditCardId: "card-1",
  date: "2026-10-20T03:00:00.000Z",
  description: "Notebook",
  id: "plan-1",
  installmentCount: 2,
  installments: [],
  overLimit: false,
  owner: OwnerType.USER,
  ownerId: "user-id",
  totalValue: "66.67",
});
const plans = {
  createInstallmentPlan: jest.fn(),
  deleteInstallmentPlan: jest.fn(),
  getInstallmentPlan: jest.fn(),
  updateInstallmentPlan: jest.fn(),
};
const repositories = {
  financialRepository: { installmentPlan: plans },
} as unknown as Repositories;

const createParams = {
  categoryId: "category-1",
  creditCardId: "card-1",
  date: "2026-10-20T03:00:00.000Z",
  description: "Notebook",
  installments: 10,
  owner: "USER",
  ownerId: "user-id",
  value: "5120.00",
};

beforeEach(() => {
  jest.clearAllMocks();
  plans.createInstallmentPlan.mockResolvedValue(entity);
  plans.getInstallmentPlan.mockResolvedValue(entity);
  plans.updateInstallmentPlan.mockResolvedValue(entity);
});

describe("createInstallmentPlanUseCase", () => {
  const useCase = createInstallmentPlanUseCase(repositories);

  it("SHOULD create the plan AND return the DTO", async () => {
    const result = await useCase.execute(createParams);

    expect(result).toBeInstanceOf(InstallmentPlanDTO);
    expect(plans.createInstallmentPlan).toHaveBeenCalledWith(
      expect.objectContaining({ installments: 10, owner: OwnerType.USER }),
    );
  });

  it.each([1, 49, 2.5])(
    "SHOULD reject %s installments WITHOUT calling the repository",
    async (installments) => {
      await expect(
        useCase.execute({ ...createParams, installments }),
      ).rejects.toBeInstanceOf(FieldInvalid);
      expect(plans.createInstallmentPlan).not.toHaveBeenCalled();
    },
  );

  it("SHOULD reject an unknown owner", async () => {
    await expect(
      useCase.execute({ ...createParams, owner: "NOPE" }),
    ).rejects.toBeInstanceOf(FieldInvalid);
  });

  it("SHOULD add the use case to the context of a known error AND rethrow others", async () => {
    const error = new GenericError();
    const addContext = jest.spyOn(error, "addContext");

    plans.createInstallmentPlan.mockRejectedValueOnce(error);
    await expect(useCase.execute(createParams)).rejects.toBe(error);
    expect(addContext).toHaveBeenCalledWith({
      useCase: "financial.createInstallmentPlanUseCase",
    });

    const unknown = new Error("boom");

    plans.createInstallmentPlan.mockRejectedValueOnce(unknown);
    await expect(useCase.execute(createParams)).rejects.toBe(unknown);
    expect(error).toBeInstanceOf(DefaultError);
  });
});

describe("getInstallmentPlanUseCase", () => {
  it("SHOULD return the DTO of the plan", async () => {
    const result =
      await getInstallmentPlanUseCase(repositories).execute("plan-1");

    expect(result.id).toBe("plan-1");
    expect(plans.getInstallmentPlan).toHaveBeenCalledWith("plan-1");
  });

  it("SHOULD add context to a known error", async () => {
    const error = new GenericError();

    plans.getInstallmentPlan.mockRejectedValueOnce(error);
    await expect(
      getInstallmentPlanUseCase(repositories).execute("plan-1"),
    ).rejects.toBe(error);
  });
});

describe("updateInstallmentPlanUseCase", () => {
  const useCase = updateInstallmentPlanUseCase(repositories);

  it("SHOULD forward only the sent fields", async () => {
    await useCase.execute({ description: "Laptop", id: "plan-1" });

    expect(plans.updateInstallmentPlan).toHaveBeenCalledWith({
      categoryId: undefined,
      creditCardId: undefined,
      date: undefined,
      description: "Laptop",
      id: "plan-1",
      installments: undefined,
      value: undefined,
    });
  });

  it("SHOULD reject a count outside 2-48 WITHOUT calling the repository", async () => {
    await expect(
      useCase.execute({ id: "plan-1", installments: 60 }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    expect(plans.updateInstallmentPlan).not.toHaveBeenCalled();
  });

  it("SHOULD add context to a known error AND rethrow others", async () => {
    const error = new GenericError();

    plans.updateInstallmentPlan.mockRejectedValueOnce(error);
    await expect(
      useCase.execute({ description: "x", id: "plan-1" }),
    ).rejects.toBe(error);

    const unknown = new Error("boom");

    plans.updateInstallmentPlan.mockRejectedValueOnce(unknown);
    await expect(
      useCase.execute({ description: "x", id: "plan-1" }),
    ).rejects.toBe(unknown);
  });
});

describe("deleteInstallmentPlanUseCase", () => {
  it("SHOULD delete by id AND add context to known errors", async () => {
    const useCase = deleteInstallmentPlanUseCase(repositories);

    await useCase.execute("plan-1");
    expect(plans.deleteInstallmentPlan).toHaveBeenCalledWith("plan-1");

    const error = new GenericError();

    plans.deleteInstallmentPlan.mockRejectedValueOnce(error);
    await expect(useCase.execute("plan-1")).rejects.toBe(error);

    const unknown = new Error("boom");

    plans.deleteInstallmentPlan.mockRejectedValueOnce(unknown);
    await expect(useCase.execute("plan-1")).rejects.toBe(unknown);
  });
});
