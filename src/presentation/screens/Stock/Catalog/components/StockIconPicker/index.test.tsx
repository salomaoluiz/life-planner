import { fireEvent, render, screen } from "@tests";

import useIconSearch from "@screens/Financial/Categories/modals/NewCategoryModal/hooks/useIconSearch";

import StockIconPicker from "./";

jest.mock(
  "@screens/Financial/Categories/modals/NewCategoryModal/hooks/useIconSearch",
);
jest.mock(
  "@screens/Financial/Categories/modals/NewCategoryModal/components/IconPickerSheet",
  () => ({
    __esModule: true,
    default: (props: {
      groups: Array<{ icons: unknown[]; title: string }>;
      onQueryChange: (text: string) => void;
      onSelect: (name: string) => void;
      query: string;
      results: Array<{ label: string; value: string }>;
      selected: string;
    }) => {
      const { Pressable, Text } = jest.requireActual("react-native");

      return (
        <Pressable
          onPress={() => {
            props.onQueryChange("fri");
            props.onSelect("fridge");
          }}
          testID="picker"
        >
          <Text>{`${props.selected}|${props.query}|${props.results.map((r) => r.label).join(",")}|${props.groups.map((g) => g.title).join(",")}`}</Text>
        </Pressable>
      );
    },
  }),
);

const icons = [
  { group: "HOME", labelEn: "Fridge", labelPt: "Geladeira", name: "fridge" },
];

it("SHOULD list the catalog with its labels, then select an icon and close", () => {
  jest.mocked(useIconSearch).mockReturnValue({
    debouncedQuery: "",
    groups: [{ group: "HOME", icons }],
    icons,
    retry: jest.fn(),
    status: "success",
  } as never);
  const onSelect = jest.fn();
  const onClose = jest.fn();

  render(
    <StockIconPicker onClose={onClose} onSelect={onSelect} selected="cup" />,
  );

  expect(screen.getByText(/cup\|\|/)).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId("picker"));

  expect(onSelect).toHaveBeenCalledWith("fridge");
  expect(onClose).toHaveBeenCalled();
});
