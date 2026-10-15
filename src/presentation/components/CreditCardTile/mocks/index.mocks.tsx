import { render } from "@tests";

import { CreditCardTile, Text } from "@components";

function setup(
  props: Partial<React.ComponentProps<typeof CreditCardTile>> = {},
) {
  const onPress = jest.fn();

  render(
    <CreditCardTile
      accessibilityLabel="Main card, Visa, available R$ 5.000,00"
      available={<Text.BodyStrong value="R$ 5.000,00" />}
      availableLabel="Available"
      brandLabel="Visa"
      lastDigits="1234"
      onPress={onPress}
      testID="tile"
      tint="#6366F1"
      title="Main card"
      {...props}
    />,
  );

  return { onPress };
}

export { setup };
