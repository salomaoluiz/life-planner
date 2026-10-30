import { act } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import { GenericError } from "@domain/entities/errors";

import {
  givenData,
  setup,
  spies,
  tag,
  tagsQuery,
} from "./mocks/useTagsViewModel.mocks";
import { fetchTags } from "./useTagsViewModel";

it("SHOULD load the owners then the tags of those owners", async () => {
  const owners = [{ id: "user-id", name: "Alice", type: "USER" }];
  const tags = [tag("a")];
  spies.getOwners.mockResolvedValue(owners as never);
  spies.getTags.mockResolvedValue(tags);

  expect(await fetchTags()).toEqual({ owners, tags });
  expect(spies.getTags).toHaveBeenCalledWith(["user-id"]);
});

it("SHOULD list the tags by name AND hide the ones that only live in archived families under All", () => {
  givenData([
    tag("b"),
    tag("A"),
    tag("old", ["family-2"]),
    tag("shared", ["user-id", "family-2"], "ALL"),
  ]);
  const { result } = setup();

  expect(result.current.rows.map((row) => row.name)).toEqual([
    "A",
    "b",
    "shared",
  ]);
  expect(result.current.isEmpty).toBe(false);
});

it("SHOULD filter by owner AND mark an archived family as read-only", () => {
  givenData([tag("mine"), tag("old", ["family-2"])]);
  const { result } = setup();

  act(() => {
    result.current.onOwnerFilterChange("family-2");
  });

  expect(result.current.rows.map((row) => row.name)).toEqual(["old"]);
  expect(result.current.readOnly).toBe(true);

  act(() => {
    result.current.onAddPress();
  });

  expect(modalNavigation.openModal).not.toHaveBeenCalled();
  expect(result.current.toastVisible).toBe(true);
  act(() => {
    result.current.onToastHide();
  });
  expect(result.current.toastVisible).toBe(false);
});

it("SHOULD open the form to add and to edit a row", () => {
  givenData([]);
  const { result } = setup();

  result.current.onAddPress();
  result.current.onRowPress("tag-1");

  expect(modalNavigation.openModal).toHaveBeenNthCalledWith(1, "add_new_tag");
  expect(modalNavigation.openModal).toHaveBeenNthCalledWith(2, "add_new_tag", {
    id: "tag-1",
  });
});

it("SHOULD flag empty AND expose the loading, refreshing and error states", () => {
  givenData([]);
  const { result } = setup();

  expect(result.current.isEmpty).toBe(true);
  expect(result.current.ownerChoices[0].value).toBe("ALL");

  tagsQuery.reset().withError(new GenericError());
  spies.useQuery.mockReturnValue(tagsQuery.build() as never);
  expect(setup().result.current.errorMessage).toBe("Occurred an error");
});

it("SHOULD refetch WHEN focused AND on refresh and retry", async () => {
  givenData([]);
  spies.isFocused.mockReturnValue(true);
  const { result } = setup();
  const refetch = tagsQuery.build().refetch;

  await result.current.onRefresh();
  await result.current.onRetry();

  expect(refetch).toHaveBeenCalledTimes(3);
});
