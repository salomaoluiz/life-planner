import {
  ApiBusinessError,
  CategoryHasPendingItems,
  GenericError,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import updateCategoryAppearance from "./updateCategoryAppearance";

jest.mock("@infrastructure/api", () => ({
  api: { patch: jest.fn() },
}));

const params = {
  descendants: [
    { iconColor: "black", id: "child" },
    { icon: "folder", iconColor: "#112233", id: "grandchild" },
  ],
  icon: "food",
  iconColor: "#F97316",
  id: "parent",
};

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD PATCH /appearance with the editable fields and the descendants (colors in API format)", async () => {
  jest.mocked(api.patch).mockResolvedValueOnce({});

  await updateCategoryAppearance(params);

  const [url, body] = jest.mocked(api.patch).mock.calls[0];

  expect(url).toBe("/v1/finance/categories/parent/appearance");
  expect(JSON.parse(JSON.stringify(body))).toEqual({
    descendants: [
      { iconColor: "#000000", id: "child" },
      { icon: "folder", iconColor: "#112233", id: "grandchild" },
    ],
    icon: "food",
    iconColor: "#F97316",
  });
});

it("SHOULD send the request WHEN only descendants change", async () => {
  jest.mocked(api.patch).mockResolvedValueOnce({});

  await updateCategoryAppearance({
    descendants: [{ icon: "folder", id: "child" }],
    id: "parent",
  });

  expect(api.patch).toHaveBeenCalledTimes(1);
});

it("SHOULD map a 422 (descendant outside the subtree) to a generic error", async () => {
  jest
    .mocked(api.patch)
    .mockRejectedValueOnce(
      new ApiBusinessError("Descendant is not in the subtree", 422),
    );

  await expect(updateCategoryAppearance(params)).rejects.toBeInstanceOf(
    GenericError,
  );
});

it("SHOULD map a 409 with blockers to CategoryHasPendingItems", async () => {
  jest.mocked(api.patch).mockRejectedValueOnce(
    new ApiBusinessError("Category has pending items", 409, undefined, {
      blockers: { installmentPlans: [], recurrences: [] },
    }),
  );

  await expect(updateCategoryAppearance(params)).rejects.toBeInstanceOf(
    CategoryHasPendingItems,
  );
});

it("SHOULD wrap an unknown error in GenericError", async () => {
  jest.mocked(api.patch).mockRejectedValueOnce(new Error("network"));

  await expect(updateCategoryAppearance(params)).rejects.toBeInstanceOf(
    GenericError,
  );
});
