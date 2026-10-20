import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import {
  BusinessError,
  FieldInvalid,
  GenericError,
} from "@domain/entities/errors";
import TagEntity from "@domain/entities/financial/TagEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import createTagUseCase from "./createTagUseCase";
import deleteTagUseCase from "./deleteTagUseCase";
import getTagsUseCase from "./getTagsUseCase";
import updateTagUseCase from "./updateTagUseCase";

const tagRepository = jest.mocked(repositoriesMocks.financialRepository.tag);

beforeEach(() => {
  jest.clearAllMocks();
});

async function caught(call: () => Promise<unknown>) {
  try {
    await call();
  } catch (error) {
    return error;
  }
}

describe("getTagsUseCase", () => {
  it("SHOULD return the tags as DTOs", async () => {
    tagRepository.getTags.mockResolvedValueOnce([
      new TagEntity({
        id: "t1",
        name: "x",
        owner: OwnerType.USER,
        ownerId: "u",
      }),
    ]);

    const tags = await getTagsUseCase(repositoriesMocks).execute(["u"]);

    expect(tagRepository.getTags).toHaveBeenCalledWith(["u"]);
    expect(tags).toEqual([expect.objectContaining({ id: "t1", name: "x" })]);
  });

  it("SHOULD add context to a business error AND rethrow other errors", async () => {
    const business = new GenericError();
    tagRepository.getTags.mockRejectedValueOnce(business);

    expect(
      await caught(async () =>
        getTagsUseCase(repositoriesMocks).execute(["u"]),
      ),
    ).toBe(business);
    expect(business).toHaveProperty("context", {
      useCase: "financial.getTagsUseCase",
    });

    const unknown = new Error("boom");
    tagRepository.getTags.mockRejectedValueOnce(unknown);

    expect(
      await caught(async () =>
        getTagsUseCase(repositoriesMocks).execute(["u"]),
      ),
    ).toBe(unknown);
  });
});

describe("createTagUseCase", () => {
  it("SHOULD trim the name AND create an All tag without ownerId", async () => {
    await createTagUseCase(repositoriesMocks).execute({
      name: "  gasto-fixo ",
      owner: "ALL",
    });

    expect(tagRepository.createTag).toHaveBeenCalledWith({
      name: "gasto-fixo",
      owner: "ALL",
      ownerId: undefined,
    });
  });

  it("SHOULD map a single owner", async () => {
    await createTagUseCase(repositoriesMocks).execute({
      name: "x",
      owner: "FAMILY",
      ownerId: "f1",
    });

    expect(tagRepository.createTag).toHaveBeenCalledWith({
      name: "x",
      owner: OwnerType.FAMILY,
      ownerId: "f1",
    });
  });

  it.each([
    ["an unknown owner", { name: "x", owner: "NOPE" }],
    ["an empty name", { name: "   ", owner: "ALL" }],
    ["a 31-character name", { name: "x".repeat(31), owner: "ALL" }],
  ])("SHOULD throw FieldInvalid for %s", async (_label, params) => {
    expect(
      await caught(async () =>
        createTagUseCase(repositoriesMocks).execute(params),
      ),
    ).toBeInstanceOf(FieldInvalid);
    expect(tagRepository.createTag).not.toHaveBeenCalled();
  });

  it("SHOULD add context to business errors", async () => {
    const error = new BusinessError();
    tagRepository.createTag.mockRejectedValueOnce(error);

    expect(
      await caught(async () =>
        createTagUseCase(repositoriesMocks).execute({
          name: "x",
          owner: "ALL",
        }),
      ),
    ).toBe(error);
  });
});

describe("updateTagUseCase", () => {
  it("SHOULD trim the name AND send the scope", async () => {
    await updateTagUseCase(repositoriesMocks).execute({
      id: "t1",
      name: " novo ",
      scope: "ALL",
    });

    expect(tagRepository.updateTag).toHaveBeenCalledWith({
      id: "t1",
      name: "novo",
      scope: "ALL",
    });
  });

  it("SHOULD throw FieldInvalid for an empty or too long name", async () => {
    expect(
      await caught(async () =>
        updateTagUseCase(repositoriesMocks).execute({ id: "t1", name: " " }),
      ),
    ).toBeInstanceOf(FieldInvalid);
    expect(
      await caught(async () =>
        updateTagUseCase(repositoriesMocks).execute({
          id: "t1",
          name: "x".repeat(31),
        }),
      ),
    ).toBeInstanceOf(FieldInvalid);
  });

  it("SHOULD add context to business errors", async () => {
    const error = new BusinessError();
    tagRepository.updateTag.mockRejectedValueOnce(error);

    expect(
      await caught(async () =>
        updateTagUseCase(repositoriesMocks).execute({ id: "t1", scope: "ALL" }),
      ),
    ).toBe(error);
  });
});

describe("deleteTagUseCase", () => {
  it("SHOULD delete the tag", async () => {
    await deleteTagUseCase(repositoriesMocks).execute({ id: "t1" });

    expect(tagRepository.deleteTag).toHaveBeenCalledWith("t1");
  });

  it("SHOULD rethrow errors", async () => {
    const error = new Error("boom");
    tagRepository.deleteTag.mockRejectedValueOnce(error);

    expect(
      await caught(async () =>
        deleteTagUseCase(repositoriesMocks).execute({ id: "t1" }),
      ),
    ).toBe(error);
  });
});
