import { render } from "@tests";

import CategoryChips from "../";

const handlers = { onMore: jest.fn(), onSelect: jest.fn() };

const categories = [
  { colorDot: "#F59E0B", label: "Food", value: "food" },
  { colorDot: "#3B82F6", label: "Rent", value: "rent" },
];

function setup(
  props: Partial<React.ComponentProps<typeof CategoryChips>> = {},
) {
  render(
    <CategoryChips
      categories={categories}
      label={"Category"}
      moreLabel={"More"}
      {...handlers}
      {...props}
    />,
  );

  return handlers;
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { categories, setup };
