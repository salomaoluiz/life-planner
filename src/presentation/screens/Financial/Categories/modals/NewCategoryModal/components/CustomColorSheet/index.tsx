import { View } from "react-native";

import { BottomSheet, Button, IconTile, TextField } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";

interface Props {
  applyLabel: string;
  closeLabel: string;
  color: string;
  error?: string;
  hexLabel: string;
  onApply: () => void;
  onChange: (text: string) => void;
  onClose: () => void;
  title: string;
  value: string;
}

const HEX_LENGTH = 7;

function CustomColorSheet(props: Props) {
  const { spacing } = useKitTheme();
  const isInvalid = !!props.error || props.value.length !== HEX_LENGTH;

  return (
    <BottomSheet
      closeLabel={props.closeLabel}
      footer={
        <Button.Primary
          disabled={isInvalid}
          fullWidth
          label={props.applyLabel}
          onPress={props.onApply}
          size={"lg"}
        />
      }
      onClose={props.onClose}
      title={props.title}
      visible
    >
      <View style={{ gap: spacing.md }}>
        <IconTile color={props.color} name={"folder"} size={"lg"} />
        <TextField
          autoCapitalize={"characters"}
          error={props.error}
          label={props.hexLabel}
          maxLength={HEX_LENGTH}
          onChangeText={props.onChange}
          placeholder={"#RRGGBB"}
          value={props.value}
        />
      </View>
    </BottomSheet>
  );
}

export default CustomColorSheet;
