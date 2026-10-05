import { StyleSheet, View } from "react-native";

import BottomSheet from "@components/BottomSheet";
import Button from "@components/Button";
import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface ConfirmDialogProps {
  cancelLabel: string;
  closeLabel: string;
  confirmLabel: string;
  loading?: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  testID?: string;
  title: string;
  visible: boolean;
}

function ConfirmDialog(props: ConfirmDialogProps) {
  const { spacing } = useKitTheme();
  const { testID } = props;
  const styles = StyleSheet.create({ footer: { gap: spacing.xs } });

  return (
    <BottomSheet
      closeLabel={props.closeLabel}
      footer={
        <View style={styles.footer}>
          <Button.Destructive
            fullWidth
            label={props.confirmLabel}
            loading={props.loading}
            onPress={props.onConfirm}
            size="lg"
            testID={testID && `${testID}-confirm`}
          />
          <Button.Secondary
            fullWidth
            label={props.cancelLabel}
            onPress={props.onCancel}
            size="lg"
            testID={testID && `${testID}-cancel`}
          />
        </View>
      }
      onClose={props.onCancel}
      testID={testID}
      title={props.title}
      visible={props.visible}
    >
      <Text.Body
        testID={testID && `${testID}-message`}
        tone="secondary"
        value={props.message}
      />
    </BottomSheet>
  );
}

export default ConfirmDialog;
