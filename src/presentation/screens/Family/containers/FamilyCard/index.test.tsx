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
