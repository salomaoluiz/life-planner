import { mocks, setup } from "./mocks/customStyles.mocks";

it("SHOULD return empty object if no props are passed", () => {
  const result = setup(mocks.defaultProps);

  expect(result).toEqual({});
});

it("SHOULD return partial styles custom styles", () => {
  const result = setup(mocks.partialProps);

  expect(result).toEqual({ color: "red" });
});

it("SHOULD return full custom styles", () => {
  const result = setup(mocks.fullProps);

  expect(result).toEqual({
    color: "red",
    textAlign: "center",
  });
});
