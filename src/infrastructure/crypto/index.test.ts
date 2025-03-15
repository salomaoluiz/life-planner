import * as Crypto from "expo-crypto";

import { setup, spies } from "./mocks/index.mocks";

it("SHOULD encode the data", async () => {
  const props = {
    id: "123",
  };

  const encoded = await setup(props);

  expect(spies.digestStringAsync).toHaveBeenCalledTimes(1);
  expect(spies.digestStringAsync).toHaveBeenCalledWith(
    Crypto.CryptoDigestAlgorithm.SHA256,
    JSON.stringify(props),
  );
  expect(encoded).toEqual("encoded-data");
});
