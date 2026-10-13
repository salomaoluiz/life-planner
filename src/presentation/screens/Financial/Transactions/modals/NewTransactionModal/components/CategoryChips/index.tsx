import { ChipGroup } from "@components";

interface Props {
  categories: { colorDot: string; label: string; value: string }[];
  error?: string;
  label: string;
  moreLabel: string;
  onMore: () => void;
  onSelect: (id: string) => void;
  selected?: string;
}

const MORE_VALUE = "__more__";

function CategoryChips(props: Props) {
  function onChange(value: string) {
    if (value === MORE_VALUE) {
      props.onMore();
      return;
    }
    props.onSelect(value);
  }

  return (
    <ChipGroup
      error={props.error}
      label={props.label}
      layout={"wrap"}
      mode={"single"}
      onChange={onChange}
      options={[
        ...props.categories,
        { label: props.moreLabel, value: MORE_VALUE, variant: "add" },
      ]}
      testID={"transaction-category-chips"}
      value={props.selected}
    />
  );
}

export default CategoryChips;
