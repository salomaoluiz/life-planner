import * as Sentry from "@sentry/react-native";

import SentryWrapper from "./wrapper";

jest.mock("@sentry/react-native");

const wrapSpy = jest.spyOn(Sentry, "wrap");

it("SHOULD wrap the child with Sentry", () => {
  const child = () => null;

  SentryWrapper(child);

  expect(wrapSpy).toHaveBeenCalledTimes(1);
  expect(wrapSpy).toHaveBeenCalledWith(child);
});
