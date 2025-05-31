import { mocks, setup } from "./mocks/FinancialCategoriesViewModel.mocks";

it("SHOULD return all the categories with 1 level", () => {
  const result = setup();

  expect(result.categories).toHaveLength(mocks.dtos.length);
  expect(result.categories[0].id).toEqual(mocks.dtos[0].id);
  expect(result.categories[1].id).toEqual(mocks.dtos[1].id);
});

it("SHOULD return all the categories with 2 levels", () => {
  const dtos = [...mocks.dtos, ...mocks.dtosChildren];

  const result = setup(dtos);

  expect(result.categories).toHaveLength(4);
  expect(result.categories[0].id).toEqual(mocks.dtos[0].id);
  expect(result.categories[1].id).toEqual(mocks.dtosChildren[0].id);
  expect(result.categories[2].id).toEqual(mocks.dtos[1].id);
  expect(result.categories[3].id).toEqual(mocks.dtosChildren[1].id);
});

it("SHOULD return all the categories with 3 levels", () => {
  const dtos = [...mocks.dtos, ...mocks.dtosChildren, ...mocks.dtosSubChildren];

  const result = setup(dtos);

  expect(result.categories).toHaveLength(6);
  expect(result.categories[0].id).toEqual(mocks.dtos[0].id);
  expect(result.categories[1].id).toEqual(mocks.dtosChildren[0].id);
  expect(result.categories[2].id).toEqual(mocks.dtosSubChildren[0].id);
  expect(result.categories[3].id).toEqual(mocks.dtos[1].id);
  expect(result.categories[4].id).toEqual(mocks.dtosChildren[1].id);
  expect(result.categories[5].id).toEqual(mocks.dtosSubChildren[1].id);
});
