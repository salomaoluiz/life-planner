import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, presentation: "transparentModal" }}
    >
      <Stack.Screen name="family/add_new_family_member" />
      <Stack.Screen name="family/add_new_family" />
      <Stack.Screen name={"business_feedback"} />
      <Stack.Screen name={"stock/add_new_stock_item"} />
      <Stack.Screen name={"financial/transaction/add_new_transaction"} />
      <Stack.Screen name={"financial/category/add_new_category"} />
      <Stack.Screen name={"financial/section_picker"} />
      <Stack.Screen name={"financial/account/add_new_account"} />
      <Stack.Screen name={"financial/credit_card/add_new_credit_card"} />
      <Stack.Screen name={"financial/invoice/invoice_detail"} />
      <Stack.Screen name={"financial/installment/edit_installment"} />
      <Stack.Screen name={"financial/prepayment/prepay_installments"} />
      <Stack.Screen name={"financial/refund/card_refund"} />
      <Stack.Screen name={"financial/early_payment/card_early_payment"} />
      <Stack.Screen name={"invite"} />
      <Stack.Screen name={"quick_add"} />
    </Stack>
  );
}
