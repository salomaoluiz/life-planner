import {
  ApiBusinessError,
  FieldInvalid,
  FinancialNotFound,
  GenericError,
  TagNameInUse,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import createTag from "./createTag";
import deleteTag from "./deleteTag";
import getTags from "./getTags";
import updateTag from "./updateTag";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn(), get: jest.fn(), patch: jest.fn(), post: jest.fn() },
}));

const apiTag = {
  id: "6f1c0f2e-1111-4a2b-8c3d-000000000001",
  name: "gasto-fixo",
  owner: "USER",
  ownerId: "1b2c0f2e-1111-4a2b-8c3d-000000000002",
  scope: "PERSONAL",
  scopes: [{ owner: "USER", ownerId: "1b2c0f2e-1111-4a2b-8c3d-000000000002" }],
  usageCount: 2,
};

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

describe("getTags", () => {
  it("SHOULD GET /v1/finance/tags with one ownerId per owner AND map the models", async () => {
    jest.mocked(api.get).mockResolvedValueOnce([apiTag]);

    const result = await getTags(["a", "b"]);

    expect(api.get).toHaveBeenCalledWith(
      "/v1/finance/tags?ownerId=a&ownerId=b",
    );
    expect(result[0]).toMatchObject({ name: "gasto-fixo", usageCount: 2 });
  });

  it("SHOULD NOT call the API WHEN there is no owner", async () => {
    expect(await getTags([])).toEqual([]);
    expect(api.get).not.toHaveBeenCalled();
  });

  it("SHOULD wrap unknown errors in GenericError", async () => {
    jest.mocked(api.get).mockRejectedValueOnce(new Error("boom"));

    expect(await caught(async () => getTags(["a"]))).toBeInstanceOf(
      GenericError,
    );
  });
});

describe("createTag", () => {
  it("SHOULD POST the name, owner AND ownerId", async () => {
    jest.mocked(api.post).mockResolvedValueOnce(apiTag);

    const result = await createTag({
      name: "gasto-fixo",
      owner: "USER",
      ownerId: apiTag.ownerId,
    });

    expect(api.post).toHaveBeenCalledWith("/v1/finance/tags", {
      name: "gasto-fixo",
      owner: "USER",
      ownerId: apiTag.ownerId,
    });
    expect(result.id).toBe(apiTag.id);
  });

  it("SHOULD map 409 to TagNameInUse, 400 to FieldInvalid AND 404 to FinancialNotFound", async () => {
    const params = { name: "x", owner: "ALL" as const };

    jest
      .mocked(api.post)
      .mockRejectedValueOnce(
        new ApiBusinessError("Tag name already in use", 409),
      );
    expect(await caught(async () => createTag(params))).toBeInstanceOf(
      TagNameInUse,
    );

    jest
      .mocked(api.post)
      .mockRejectedValueOnce(new ApiBusinessError("bad", 400));
    expect(await caught(async () => createTag(params))).toBeInstanceOf(
      FieldInvalid,
    );

    jest
      .mocked(api.post)
      .mockRejectedValueOnce(new ApiBusinessError("none", 404));
    expect(await caught(async () => createTag(params))).toBeInstanceOf(
      FinancialNotFound,
    );
  });
});

describe("updateTag", () => {
  it("SHOULD PATCH only the sent fields", async () => {
    await updateTag({ id: "t1", name: "novo" });

    expect(api.patch).toHaveBeenCalledWith("/v1/finance/tags/t1", {
      name: "novo",
      scope: undefined,
    });
  });

  it("SHOULD NOT call the API WHEN nothing changes", async () => {
    await updateTag({ id: "t1" });

    expect(api.patch).not.toHaveBeenCalled();
  });

  it("SHOULD map 409 to TagNameInUse", async () => {
    jest
      .mocked(api.patch)
      .mockRejectedValueOnce(
        new ApiBusinessError("Tag name already in use", 409),
      );

    expect(
      await caught(async () => updateTag({ id: "t1", scope: "ALL" })),
    ).toBeInstanceOf(TagNameInUse);
  });
});

describe("deleteTag", () => {
  it("SHOULD DELETE the tag", async () => {
    await deleteTag("t1");

    expect(api.delete).toHaveBeenCalledWith("/v1/finance/tags/t1");
  });

  it("SHOULD map 404 to FinancialNotFound", async () => {
    jest
      .mocked(api.delete)
      .mockRejectedValueOnce(new ApiBusinessError("none", 404));

    expect(await caught(async () => deleteTag("t1"))).toBeInstanceOf(
      FinancialNotFound,
    );
  });
});
