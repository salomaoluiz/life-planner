import { BottomSheet, Button, IconTile, Text } from "@components";

export interface Props {
  closeLabel: string;
  message?: string;
  okLabel: string;
  onClose: () => void;
  testID: string;
  title: string;
  visible: boolean;
}

function NoticeSheet(props: Props) {
  return (
    <BottomSheet
      closeLabel={props.closeLabel}
      footer={
        <Button.Primary
          fullWidth
          label={props.okLabel}
          onPress={props.onClose}
          size="lg"
          testID={`${props.testID}-ok`}
        />
      }
      onClose={props.onClose}
      testID={props.testID}
      title={props.title}
      visible={props.visible}
    >
      <IconTile name="alert-circle-outline" size="lg" tone="expense" />
      {props.message ? (
        <Text.Body tone="secondary" value={props.message} />
      ) : null}
    </BottomSheet>
  );
}

export default NoticeSheet;
