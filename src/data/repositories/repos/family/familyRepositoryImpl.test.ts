import { mocks, setup, spies } from "./mocks/familyRepositoryImpl.mocks";

it("SHOULD call createFamily correctly", async () => {
  const { createFamily } = setup();

  const params = {
    id: "bb3443d4-a9bd-401e-9732-d6bf0dca7e83",
    name: "Family name",
    ownerId: "bb3443d4-a9bd-401e-9732-d6bf0dca7e83",
  };

  const family = await createFamily(params);

  expect(spies.createFamily).toHaveBeenCalledTimes(1);
  expect(spies.createFamily).toHaveBeenCalledWith(params, mocks.datasources);
  expect(family).toEqual("createFamily response");
});

it("SHOULD call deleteFamily correctly", async () => {
  const { deleteFamily } = setup();

  const familyId = "bb3443d4-a9bd-401e-9732-d6bf0dca7e83";

  await deleteFamily(familyId);

  expect(spies.deleteFamily).toHaveBeenCalledTimes(1);
  expect(spies.deleteFamily).toHaveBeenCalledWith(familyId, mocks.datasources);
});

it("SHOULD call getFamilies correctly", async () => {
  const { getFamilies } = setup();

  const userId = "bb3443d4-a9bd-401e-9732-d6bf0dca7e83";

  const families = await getFamilies(userId);

  expect(spies.getFamilies).toHaveBeenCalledTimes(1);
  expect(spies.getFamilies).toHaveBeenCalledWith(userId, mocks.datasources);
  expect(families).toEqual("getFamilies response");
});

it("SHOULD call getFamilyById correctly", async () => {
  const { getFamilyById } = setup();

  const familyId = "bb3443d4-a9bd-401e-9732-d6bf0dca7e83";

  const family = await getFamilyById(familyId);

  expect(spies.getFamilyById).toHaveBeenCalledTimes(1);
  expect(spies.getFamilyById).toHaveBeenCalledWith(familyId, mocks.datasources);
  expect(family).toEqual("getFamilyById response");
});

it("SHOULD call updateFamily correctly", async () => {
  const { updateFamily } = setup();

  const params = {
    id: "bb3443d4-a9bd-401e-9732-d6bf0dca7e83",
    name: "Family name",
    ownerId: "bb3443d4-a9bd-401e-9732-d6bf0dca7e83",
  };

  await updateFamily(params);

  expect(spies.updateFamily).toHaveBeenCalledTimes(1);
  expect(spies.updateFamily).toHaveBeenCalledWith(params, mocks.datasources);
});
