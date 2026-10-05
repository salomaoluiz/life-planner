import { waitFor } from "@tests";

import {
  AccountHasTransactions,
  CategoryHasTransactions,
  FieldInvalid,
  FinancialNotFound,
  FinancialOwnerNotAllowed,
  GenericError,
} from "@domain/entities/errors";
import {
  FeedbackActions,
  FeedbackNavigationTypes,
} from "@screens/Feedback/BusinessFeedback/actions/types";
import { FeedbackType } from "@screens/Feedback/BusinessFeedback/types";

import { setup, spies } from "./mocks/index.mocks";

const goBack = {
  action: FeedbackActions.NAVIGATION,
  type: FeedbackNavigationTypes.GO_BACK,
};

it.each([
  [new AccountHasTransactions(), "financial.accounts.errors.hasTransactions"],
  [
    new CategoryHasTransactions(),
    "financial.categories.errors.hasTransactions",
  ],
  [new FinancialNotFound(), "financial.errors.notFound"],
  [new FinancialOwnerNotAllowed(), "financial.errors.ownerNotAllowed"],
])(
  "SHOULD open the error feedback for %s with the localized message",
  async (error, message) => {
    setup(error);

    await waitFor(() => expect(spies.push).toHaveBeenCalledTimes(1));

    expect(spies.encode).toHaveBeenCalledWith({
      closeButton: goBack,
      message,
      primaryButton: { ...goBack, label: "financial.errors.close" },
      title: "financial.errors.title",
      type: FeedbackType.Error,
    });
    expect(spies.push).toHaveBeenCalledWith({
      params: { feedback: "encoded-feedback" },
      pathname: "/business_feedback",
    });
  },
);

it.each([
  ["a GenericError", new GenericError()],
  ["a FieldInvalid", new FieldInvalid({ name: "x" })],
  ["null", null],
  ["undefined", undefined],
])("SHOULD do nothing for %s", async (_label, error) => {
  setup(error);

  await Promise.resolve();

  expect(spies.encode).not.toHaveBeenCalled();
  expect(spies.push).not.toHaveBeenCalled();
});

it("SHOULD NOT open the feedback again WHEN it re-renders with the same error object", async () => {
  const error = new AccountHasTransactions();
  const { rerender } = setup(error);
  await waitFor(() => expect(spies.push).toHaveBeenCalledTimes(1));

  rerender({ error });
  await Promise.resolve();

  expect(spies.push).toHaveBeenCalledTimes(1);
});
