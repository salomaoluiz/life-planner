import { waitFor } from "@tests";

import { FamilyHasRecords, GenericError } from "@domain/entities/errors";
import {
  FeedbackActions,
  FeedbackNavigationTypes,
} from "@screens/Feedback/BusinessFeedback/actions/types";
import { FeedbackType } from "@screens/Feedback/BusinessFeedback/types";

import { mocks, setup, spies } from "./mocks/index.mocks";

it("SHOULD render the family card with the family and refetch callback", () => {
  const { family, props } = setup();

  expect(props.family).toBe(family);
  expect(props.refetchFamilies).toBe(mocks.refetchFamilies);
});

it("SHOULD configure the delete mutation with the use case", () => {
  setup();

  expect(spies.useMutation).toHaveBeenCalledWith({
    cacheKey: ["delete_family"],
    fetch: mocks.useCases.deleteFamilyUseCase.execute,
  });
});

it("SHOULD open the add member modal with the family id", () => {
  const { props } = setup();

  props.onAddNewFamilyMember();

  expect(spies.push).toHaveBeenCalledWith({
    params: { familyId: "family-1" },
    pathname: "/(app)/(modals)/family/add_new_family_member",
  });
});

it("SHOULD delete the family WHEN onDeleteFamily is called", async () => {
  const { mutate, props } = setup();

  await props.onDeleteFamily();

  expect(mutate).toHaveBeenCalledWith({ id: "family-1" });
});

it("SHOULD refetch families WHEN the delete succeeded", () => {
  setup("success");

  expect(mocks.refetchFamilies).toHaveBeenCalledTimes(1);
});

it.each(["idle", "error"] as const)(
  "SHOULD NOT refetch families WHEN the delete status is %s",
  (status) => {
    setup(status);

    expect(mocks.refetchFamilies).not.toHaveBeenCalled();
  },
);

it("SHOULD open the localized error feedback WHEN the delete is blocked (409)", async () => {
  setup("error", new FamilyHasRecords());

  await waitFor(() => expect(spies.push).toHaveBeenCalledTimes(1));

  const dismiss = {
    action: FeedbackActions.NAVIGATION,
    route: "/family",
    type: FeedbackNavigationTypes.DISMISS_TO,
  };
  expect(spies.encode).toHaveBeenCalledWith({
    closeButton: dismiss,
    message: "family.deleteBlocked.message",
    primaryButton: { ...dismiss, label: "family.deleteBlocked.close" },
    title: "family.deleteBlocked.title",
    type: FeedbackType.Error,
  });
  expect(spies.push).toHaveBeenCalledWith({
    params: { feedback: "encoded-feedback" },
    pathname: "/business_feedback",
  });
});

it("SHOULD keep the family in the list (no refetch) WHEN the delete is blocked", async () => {
  setup("error", new FamilyHasRecords());

  await waitFor(() => expect(spies.push).toHaveBeenCalled());

  expect(mocks.refetchFamilies).not.toHaveBeenCalled();
});

it("SHOULD NOT open the feedback WHEN the delete fails with another error", () => {
  setup("error", new GenericError());

  expect(spies.push).not.toHaveBeenCalled();
  expect(spies.encode).not.toHaveBeenCalled();
});

it("SHOULD NOT open the feedback WHEN there is no error", () => {
  setup();

  expect(spies.push).not.toHaveBeenCalled();
});

it("SHOULD pass the translated add-member label to the card", () => {
  const { props } = setup();

  expect(props.addMemberLabel).toBe("family.member.addButton");
});
