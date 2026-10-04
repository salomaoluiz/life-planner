import { encode } from "@infrastructure/crypto";

import { FeedbackActions, FeedbackNavigationTypes } from "./actions/types";
import { FeedbackType, RouteDecryptedProps } from "./types";
import { createFeedbackRouteEncoded, decodeRouteParams } from "./utils";

const route: RouteDecryptedProps = {
  closeButton: {
    action: FeedbackActions.NAVIGATION,
    type: FeedbackNavigationTypes.GO_BACK,
  },
  message: "Done",
  primaryButton: {
    action: FeedbackActions.COPY_TO_CLIPBOARD,
    label: "Copy",
    value: "text",
  },
  title: "Success",
  type: FeedbackType.Success,
};

it("SHOULD encode the route under the feedback key", async () => {
  const result = await createFeedbackRouteEncoded(route);

  expect(Object.keys(result)).toEqual(["feedback"]);
  expect(result.feedback).toBe(await encode({ ...route }));
});

it("SHOULD decode what was encoded", async () => {
  const { feedback } = await createFeedbackRouteEncoded(route);

  expect(await decodeRouteParams({ feedback })).toEqual(route);
});

it("SHOULD drop unknown fields WHEN decoding", async () => {
  const feedback = await encode({ ...route, extra: "ignored" });

  expect(await decodeRouteParams({ feedback })).toEqual(route);
});

it("SHOULD reject WHEN the feedback token is not valid", async () => {
  await expect(decodeRouteParams({ feedback: "not-json" })).rejects.toThrow();
});
