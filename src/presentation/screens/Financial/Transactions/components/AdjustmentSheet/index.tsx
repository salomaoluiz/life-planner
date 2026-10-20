import { useState } from "react";
import { View } from "react-native";

import {
  AmountText,
  BottomSheet,
  Button,
  ConfirmDialog,
  Text,
} from "@components";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

interface Props {
  accountName: string;
  amountCents: number;
  amountType: "EXPENSE" | "INCOME";
  cancelLabel: string;
  closeLabel: string;
  confirmLabel: string;
  currency: CurrencyCode;
  deleteLabel: string;
  deleteMessage: string;
  deleteTitle: string;
  errorMessage?: string;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: () => void;
  title: string;
}

function AdjustmentSheet(props: Props) {
  const [isConfirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <BottomSheet
        closeLabel={props.closeLabel}
        footer={
          <Button.Ghost
            label={props.deleteLabel}
            onPress={() => setConfirmOpen(true)}
            testID={transactionsTestIds.adjustmentDelete}
            tone={"expense"}
          />
        }
        onClose={props.onClose}
        subtitle={props.accountName}
        testID={transactionsTestIds.adjustmentSheet}
        title={props.title}
        visible
      >
        <View>
          <AmountText
            currency={props.currency}
            size={"heading"}
            type={props.amountType}
            value={props.amountCents}
          />
          {props.errorMessage && (
            <Text.Body tone={"expense"} value={props.errorMessage} />
          )}
        </View>
      </BottomSheet>
      <ConfirmDialog
        cancelLabel={props.cancelLabel}
        closeLabel={props.closeLabel}
        confirmLabel={props.confirmLabel}
        loading={props.isDeleting}
        message={props.deleteMessage}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          props.onDelete();
        }}
        testID={transactionsTestIds.adjustmentDeleteDialog}
        title={props.deleteTitle}
        visible={isConfirmOpen}
      />
    </>
  );
}

export default AdjustmentSheet;
