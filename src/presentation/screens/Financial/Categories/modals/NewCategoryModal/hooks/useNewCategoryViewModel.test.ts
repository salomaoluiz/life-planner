import { act } from "@tests";

import { CategoryHasTransactions } from "@domain/entities/errors";

import {
  cat,
  givenLoaded,
  mutations,
  setup,
  spies,
  tx,
} from "./mocks/useNewCategoryViewModel.mocks";

it("SHOULD start a new category as expense, indigo, folder, Personal, without parent", () => {
  givenLoaded();
  const { result } = setup();

  expect(result.current.isEditing).toBe(false);
  expect(result.current.type).toBe("EXPENSE");
  expect(result.current.iconColor).toBe("#6366F1");
  expect(result.current.icon).toBe("folder");
  expect(result.current.ownerId).toBe("user-id");
  expect(result.current.parentId).toBe("");
  expect(result.current.titleKey).toBe("financial.categories.new");
  expect(result.current.saveLabelKey).toBe("financial.categories.form.save");
});

it("SHOULD preset type and owner from the route params and lock the owner", () => {
  givenLoaded({ params: { ownerId: "family-1", type: "INCOME" } });
  const { result } = setup();

  expect(result.current.type).toBe("INCOME");
  expect(result.current.ownerId).toBe("family-1");
  expect(result.current.isOwnerLocked).toBe(true);
});

it("SHOULD prefill in edit mode and report notFound for an unknown id", () => {
  givenLoaded({
    categories: [cat("c1", { name: "Old" })],
    params: { id: "c1" },
  });
  expect(setup().result.current.name).toBe("Old");

  givenLoaded({ categories: [cat("c1")], params: { id: "gone" } });
  expect(setup().result.current.isNotFound).toBe(true);
});

it("SHOULD lock the type in edit WHEN it has a parent, children or transactions", () => {
  givenLoaded({
    categories: [cat("p"), cat("c1", { parentId: "p" })],
    params: { id: "c1" },
  });
  expect(setup().result.current.isTypeLocked).toBe(true);
  expect(setup().result.current.typeHelperKey).toBe(
    "financial.categories.form.typeLocked",
  );

  givenLoaded({
    categories: [cat("p"), cat("k", { parentId: "p" })],
    params: { id: "p" },
  });
  expect(setup().result.current.isTypeLocked).toBe(true);

  givenLoaded({
    categories: [cat("solo")],
    params: { id: "solo" },
    transactions: [tx("solo")],
  });
  expect(setup().result.current.isTypeLocked).toBe(true);

  givenLoaded({ categories: [cat("solo")], params: { id: "solo" } });
  expect(setup().result.current.isTypeLocked).toBe(false);
});

it("SHOULD always lock the owner in edit and use the tree helper WHEN it has a parent or children", () => {
  givenLoaded({ categories: [cat("solo")], params: { id: "solo" } });
  expect(setup().result.current.isOwnerLocked).toBe(true);
  expect(setup().result.current.ownerHelperKey).toBe(
    "financial.common.ownerLocked",
  );

  givenLoaded({
    categories: [cat("p"), cat("c", { parentId: "p" })],
    params: { id: "c" },
  });
  expect(setup().result.current.ownerHelperKey).toBe(
    "financial.categories.form.ownerLocked",
  );

  givenLoaded();
  expect(setup().result.current.isOwnerLocked).toBe(false);
});

it("SHOULD exclude itself and its descendants from the parent options in edit", () => {
  givenLoaded({
    categories: [
      cat("a"),
      cat("b", { parentId: "a" }),
      cat("c", { parentId: "b" }),
      cat("other"),
    ],
    params: { id: "a" },
  });

  expect(
    setup().result.current.parentOptions.map((option) => option.value),
  ).toEqual(["other"]);
});

it("SHOULD only offer parents of the same owner and type", () => {
  givenLoaded({
    categories: [
      cat("mine"),
      cat("income", { type: "INCOME" }),
      cat("fam", { ownerId: "family-1" }),
    ],
  });

  expect(
    setup().result.current.parentOptions.map((option) => option.value),
  ).toEqual(["mine"]);
});

it("SHOULD clear the parent WHEN the type or the owner changes", () => {
  givenLoaded({ categories: [cat("p")] });
  const { result } = setup();

  act(() => {
    result.current.onParentChange("p");
  });
  expect(result.current.parentId).toBe("p");
  act(() => {
    result.current.onTypeChange("INCOME");
  });
  expect(result.current.parentId).toBe("");

  act(() => {
    result.current.onTypeChange("EXPENSE");
  });
  act(() => {
    result.current.onParentChange("p");
  });
  act(() => {
    result.current.onOwnerChange("family-1");
  });
  expect(result.current.parentId).toBe("");
});

it("SHOULD keep a stored color outside the palette and not send it WHEN saving untouched", () => {
  givenLoaded({
    categories: [cat("c1", { iconColor: "#123456", name: "Old" })],
    params: { id: "c1" },
  });
  const { result } = setup();

  expect(result.current.iconColor).toBe("#123456");

  act(() => {
    result.current.onNameChange("New");
  });
  act(() => {
    result.current.onSave();
  });

  expect(mutations.update.value.mutate).toHaveBeenCalledWith({
    id: "c1",
    name: "New",
  });
});

it("SHOULD apply a custom color only WHEN it is a valid #RRGGBB", () => {
  givenLoaded();
  const { result } = setup();

  act(() => {
    result.current.onCustomColorOpen();
  });
  act(() => {
    result.current.onCustomColorChange("#12345");
  });
  expect(result.current.customColorError).toBe(
    "financial.categories.form.customColorInvalid",
  );
  act(() => {
    result.current.onCustomColorApply();
  });
  expect(result.current.iconColor).toBe("#6366F1");

  act(() => {
    result.current.onCustomColorChange("#a1b2c3");
  });
  act(() => {
    result.current.onCustomColorApply();
  });
  expect(result.current.iconColor).toBe("#A1B2C3");
  expect(result.current.isCustomColorOpen).toBe(false);
});

it("SHOULD pick an icon from the sheet and keep it in the form", () => {
  givenLoaded();
  const { result } = setup();

  act(() => {
    result.current.onIconPickerOpen();
  });
  expect(result.current.pickerIcons.length).toBe(18);
  act(() => {
    result.current.onIconQueryChange("heart");
  });
  expect(result.current.pickerIcons.map((icon) => icon.value)).toEqual([
    "heart",
  ]);
  act(() => {
    result.current.onIconChange("heart");
  });

  expect(result.current.icon).toBe("heart");
  expect(result.current.isIconPickerOpen).toBe(false);
  expect(result.current.inlineIcons).toHaveLength(12);
});

it("SHOULD NOT show the name error before the first save and show it live after", () => {
  givenLoaded();
  const { result } = setup();

  expect(result.current.nameError).toBeUndefined();
  act(() => {
    result.current.onSave();
  });
  expect(result.current.nameError).toBe("financial.categories.nameRequired");
  act(() => {
    result.current.onNameChange("Food");
  });
  expect(result.current.nameError).toBeUndefined();
});

it("SHOULD create with depthLevel and the default color WHEN valid", () => {
  givenLoaded({ categories: [cat("p", { depthLevel: 0 })] });
  const { result } = setup();

  act(() => {
    result.current.onNameChange("Child");
  });
  act(() => {
    result.current.onParentChange("p");
  });
  act(() => {
    result.current.onSave();
  });

  expect(mutations.create.value.mutate).toHaveBeenCalledWith({
    depthLevel: 1,
    icon: "folder",
    iconColor: "#6366F1",
    name: "Child",
    owner: "USER",
    ownerId: "user-id",
    parentId: "p",
    type: "EXPENSE",
  });
});

it("SHOULD create with the owner and type from the route params", () => {
  givenLoaded({ params: { ownerId: "family-1", type: "INCOME" } });
  const { result } = setup();

  act(() => {
    result.current.onNameChange("Salary");
  });
  act(() => {
    result.current.onSave();
  });

  expect(mutations.create.value.mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      owner: "FAMILY",
      ownerId: "family-1",
      type: "INCOME",
    }),
  );
});

it("SHOULD send parentId null WHEN the parent is removed in edit", () => {
  givenLoaded({
    categories: [cat("p"), cat("c1", { parentId: "p" })],
    params: { id: "c1" },
  });
  const { result } = setup();

  act(() => {
    result.current.onParentChange("");
  });
  act(() => {
    result.current.onSave();
  });

  expect(mutations.update.value.mutate).toHaveBeenCalledWith({
    id: "c1",
    parentId: null,
  });
});

it("SHOULD go back without a request WHEN nothing changed in edit", () => {
  givenLoaded({ categories: [cat("c1")], params: { id: "c1" } });
  const { result } = setup();

  act(() => {
    result.current.onSave();
  });

  expect(mutations.update.value.mutate).not.toHaveBeenCalled();
  expect(spies.back).toHaveBeenCalledTimes(1);
});

it("SHOULD go back WHEN a mutation succeeds", () => {
  givenLoaded();
  mutations.create.withStatus("success");

  setup();

  expect(spies.back).toHaveBeenCalled();
});

it("SHOULD keep the values and expose the 006 key WHEN delete fails with transactions", () => {
  givenLoaded({
    categories: [cat("c1", { name: "Keep" })],
    params: { id: "c1" },
  });
  mutations.delete.withError(new CategoryHasTransactions());
  const { result } = setup();

  expect(result.current.formErrorKey).toBe(
    "financial.categories.errors.hasTransactions",
  );
  expect(result.current.name).toBe("Keep");
});

it("SHOULD ask to discard WHEN dirty and close directly otherwise", () => {
  givenLoaded();
  const { result } = setup();

  act(() => {
    result.current.onClose();
  });
  expect(spies.back).toHaveBeenCalledTimes(1);

  act(() => {
    result.current.onNameChange("x");
  });
  act(() => {
    result.current.onClose();
  });
  expect(result.current.isDiscardDialogOpen).toBe(true);
  expect(spies.back).toHaveBeenCalledTimes(1);

  act(() => {
    result.current.onDiscardConfirm();
  });
  expect(spies.back).toHaveBeenCalledTimes(2);
});

it("SHOULD confirm delete with the subcategories message WHEN it has children, then delete with id and ownerId", () => {
  givenLoaded({
    categories: [cat("p", { name: "Parent" }), cat("c", { parentId: "p" })],
    params: { id: "p" },
  });
  const { result } = setup();

  expect(result.current.deleteMessageKeys).toEqual([
    "financial.categories.deleteAlertMsg",
    "financial.categories.deleteConfirm.withSubcategories",
  ]);
  expect(result.current.deleteTitleParams).toEqual({ name: "Parent" });

  act(() => {
    result.current.onDeletePress();
  });
  act(() => {
    result.current.onDeleteConfirm();
  });

  expect(mutations.delete.value.mutate).toHaveBeenCalledWith({
    id: "p",
    ownerId: "user-id",
  });
});
