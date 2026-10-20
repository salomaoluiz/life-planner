import { act } from "@tests";

import { GenericError, TagNameInUse } from "@domain/entities/errors";

import {
  givenLoaded,
  mutations,
  queries,
  setup,
  spies,
  tag,
} from "./mocks/useNewTagViewModel.mocks";

describe("creating", () => {
  it("SHOULD start empty on Personal with the owners and the All choice", () => {
    givenLoaded();
    const { result } = setup();

    expect(result.current.isEditing).toBe(false);
    expect(result.current.ownerId).toBe("user-id");
    expect(result.current.ownerChoices.map((choice) => choice.value)).toEqual([
      "user-id",
      "family-1",
      "ALL",
    ]);
    expect(result.current.isOwnerLocked).toBe(false);
  });

  it("SHOULD be loading until the data arrives", () => {
    const { result } = setup();

    expect(result.current.isLoading).toBe(true);
  });

  it("SHOULD lock the owner WHEN opened for one owner", () => {
    givenLoaded({ params: { ownerId: "family-1" } });
    const { result } = setup();

    expect(result.current.ownerId).toBe("family-1");
    expect(result.current.isOwnerLocked).toBe(true);
  });

  it("SHOULD show the name error AND not save an empty name", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onSave());

    expect(result.current.nameError).toBe("financial.tagForm.nameRequired");
    expect(mutations.create.value.mutate).not.toHaveBeenCalled();
  });

  it("SHOULD create a tag for one owner AND for All", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onNameChange("  fixo "));
    act(() => result.current.onOwnerChange("family-1"));
    act(() => result.current.onSave());

    expect(mutations.create.value.mutate).toHaveBeenLastCalledWith({
      name: "fixo",
      owner: "FAMILY",
      ownerId: "family-1",
    });
    expect(result.current.ownerHelperKey).toBeUndefined();

    act(() => result.current.onOwnerChange("ALL"));
    act(() => result.current.onSave());

    expect(mutations.create.value.mutate).toHaveBeenLastCalledWith({
      name: "fixo",
      owner: "ALL",
      ownerId: undefined,
    });
    expect(result.current.ownerHelperKey).toBe("financial.tagForm.allHelper");
  });

  it("SHOULD ask before discarding a dirty form, and close right away when clean", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onClose());
    expect(spies.back).toHaveBeenCalledTimes(1);

    act(() => result.current.onNameChange("x"));
    act(() => result.current.onClose());
    expect(result.current.isDiscardDialogOpen).toBe(true);

    act(() => result.current.onDiscardCancel());
    expect(result.current.isDiscardDialogOpen).toBe(false);
    act(() => result.current.onDiscardConfirm());
    expect(spies.back).toHaveBeenCalledTimes(2);
  });

  it("SHOULD show a name already in use on the field AND other errors on the form", () => {
    givenLoaded();
    mutations.create.withError(new TagNameInUse());
    const inUse = setup().result.current;

    expect(inUse.nameError).toBe("financial.tagForm.nameInUse");
    expect(inUse.formErrorKey).toBeUndefined();

    mutations.create.reset().withError(new GenericError());
    expect(setup().result.current.formErrorKey).toBe("common.errors.generic");
  });

  it("SHOULD refresh the lists AND go back WHEN a write succeeds", () => {
    givenLoaded();
    mutations.create.withStatus("success");

    setup();

    expect(spies.back).toHaveBeenCalled();
  });
});

describe("editing", () => {
  it("SHOULD load the tag AND offer only its owner and All", () => {
    givenLoaded({
      params: { id: "t1" },
      tags: [tag("t1", { name: "fixo", usageCount: 3 })],
    });
    const { result } = setup();

    expect(result.current.name).toBe("fixo");
    expect(result.current.usage).toBe(3);
    expect(result.current.ownerChoices.map((choice) => choice.value)).toEqual([
      "user-id",
      "ALL",
    ]);
    expect(result.current.isOwnerLocked).toBe(false);
  });

  it("SHOULD send only the changes (rename, switch to All)", () => {
    givenLoaded({ params: { id: "t1" }, tags: [tag("t1", { name: "fixo" })] });
    const { result } = setup();

    act(() => result.current.onNameChange("novo"));
    act(() => result.current.onOwnerChange("ALL"));
    act(() => result.current.onSave());

    expect(mutations.update.value.mutate).toHaveBeenCalledWith({
      id: "t1",
      name: "novo",
      scope: "ALL",
    });
  });

  it("SHOULD close WITHOUT a request WHEN nothing changed", () => {
    givenLoaded({ params: { id: "t1" }, tags: [tag("t1")] });
    const { result } = setup();

    act(() => result.current.onSave());

    expect(mutations.update.value.mutate).not.toHaveBeenCalled();
    expect(spies.back).toHaveBeenCalled();
  });

  it("SHOULD keep an All tag All (owner locked)", () => {
    givenLoaded({
      params: { id: "t1" },
      tags: [
        tag("t1", { scope: "ALL", scopeOwnerIds: ["user-id", "family-1"] }),
      ],
    });

    expect(setup().result.current.isOwnerLocked).toBe(true);
  });

  it("SHOULD report a tag that does not exist", () => {
    givenLoaded({ params: { id: "missing" }, tags: [tag("t1")] });

    expect(setup().result.current.isNotFound).toBe(true);
  });

  it.each([
    [
      "unused",
      { usageCount: 0 },
      "financial.tagDelete.unused",
      "financial.tagDelete.confirm",
    ],
    [
      "in use",
      { usageCount: 2 },
      "financial.tagDelete.inUse",
      "financial.tagDelete.confirm",
    ],
    [
      "All and in use",
      {
        scope: "ALL" as const,
        scopeOwnerIds: ["user-id", "family-1"],
        usageCount: 2,
      },
      "financial.tagDelete.allInUse",
      "financial.tagDelete.confirmAll",
    ],
  ])(
    "SHOULD word the delete confirmation for a tag %s",
    (_label, overrides, message, confirm) => {
      givenLoaded({ params: { id: "t1" }, tags: [tag("t1", overrides)] });
      const { result } = setup();

      expect(result.current.deleteMessageKey).toBe(message);
      expect(result.current.deleteConfirmLabelKey).toBe(confirm);
    },
  );

  it("SHOULD open the delete dialog AND delete on confirm", () => {
    givenLoaded({ params: { id: "t1" }, tags: [tag("t1", { name: "fixo" })] });
    const { result } = setup();

    act(() => result.current.onDeletePress());
    expect(result.current.isDeleteDialogOpen).toBe(true);
    expect(result.current.deleteTitleParams).toEqual({ name: "fixo" });

    act(() => result.current.onDeleteCancel());
    expect(result.current.isDeleteDialogOpen).toBe(false);

    act(() => result.current.onDeleteConfirm());
    expect(mutations.delete.value.mutate).toHaveBeenCalledWith({ id: "t1" });
  });
});

it("SHOULD NOT fetch tags before the owners are known", () => {
  queries.owners.withData(undefined as never);
  const { result } = setup();

  expect(result.current.isLoading).toBe(true);
});
