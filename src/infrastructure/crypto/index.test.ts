import { setup } from "./mocks/index.mocks";

it("SHOULD encode the data", async () => {
  const props = {
    id: "123",
  };

  const encoded = await setup.encode(props);

  expect(encoded).toEqual("eyJpZCI6IjEyMyJ9");
});

it("SHOULD decode the encoded data", async () => {
  const encodedData = "eyJpZCI6IjEyMyJ9";

  const decoded = await setup.decode(encodedData);

  expect(decoded).toEqual({ id: "123" });
});
