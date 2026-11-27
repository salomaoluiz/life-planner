import { render } from "@tests";

import { CategoryTreePicker } from "@components";

import { TreePickerLabels } from "../labels";
import { TreeNode } from "../treeModel";

const onChange = jest.fn();
const onClose = jest.fn();
const onCreate = jest.fn();

const labels: TreePickerLabels = {
  apply: (count) => `Apply (${count})`,
  clear: "Clear",
  close: "Close",
  createNamed: (name) => `Create ${name}`,
  empty: "Nothing found",
  emptyHint: "Check the search",
  includedIn: (name) => `Included in ${name}`,
  more: "More",
  newLabel: "New category",
  noneLabel: "No category",
  results: (count) => `${count} results`,
  searchPlaceholder: "Search category",
};

const nodes: TreeNode[] = [
  { color: "#F59E0B", icon: "cart-outline", id: "food", name: "Food" },
  {
    color: "#FBBF24",
    icon: "cart-outline",
    id: "market",
    name: "Market",
    parentId: "food",
  },
  {
    color: "#FCD34D",
    icon: "cart-outline",
    id: "veg",
    name: "Vegetables",
    parentId: "market",
  },
  { color: "#14B8A6", icon: "home-outline", id: "home", name: "Home" },
  {
    archived: true,
    color: "#14B8A6",
    icon: "home-outline",
    id: "old",
    name: "Old",
  },
];

function setupMultiple(value: string[] = []) {
  return render(
    <CategoryTreePicker
      labels={labels}
      mode="multiple"
      nodes={nodes}
      onChange={onChange}
      onClose={onClose}
      testID="tree"
      title="Category"
      value={value}
    />,
  );
}

function setupSingle(
  props: Partial<React.ComponentProps<typeof CategoryTreePicker>> = {},
) {
  return render(
    <CategoryTreePicker
      labels={labels}
      mode="single"
      nodes={nodes}
      onChange={onChange}
      onClose={onClose}
      onCreate={onCreate}
      testID="tree"
      title="Category"
      value="home"
      {...(props as object)}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

export {
  labels,
  nodes,
  onChange,
  onClose,
  onCreate,
  setupMultiple,
  setupSingle,
};
