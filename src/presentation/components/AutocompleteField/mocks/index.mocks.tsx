import { render } from "@tests";

import { AutocompleteField } from "@components";

import { AutocompleteFieldProps } from "../";

const suggestions = [
  { id: "1", label: "gasto-fixo", meta: "24" },
  { id: "2", label: "viagem", meta: "3" },
  { id: "3", label: "Gasto Variável" },
];

const chipsProps = {
  allowCreate: true,
  createLabel: (query: string) => `Create "${query}"`,
  label: "Tags",
  maxLabel: "Up to 2 tags",
  maxLength: 10,
  maxValues: 2,
  mode: "chips" as const,
  onChange: jest.fn(),
  onQueryChange: jest.fn(),
  placeholder: "Add tag",
  removeLabel: (label: string) => `Remove ${label}`,
  resultsLabel: (count: number) => `${count} suggestions`,
  suggestions,
  testID: "ac",
  tooLongLabel: "Too long",
  values: [] as string[],
};

const textProps = {
  label: "Description",
  mode: "text" as const,
  onChangeText: jest.fn(),
  onSelect: jest.fn(),
  suggestions,
  testID: "ac",
  value: "",
};

function setup(props?: Partial<AutocompleteFieldProps>) {
  const base = props?.mode === "text" ? textProps : chipsProps;

  return render(<AutocompleteField {...base} {...(props as object)} />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { chipsProps, setup, textProps };
