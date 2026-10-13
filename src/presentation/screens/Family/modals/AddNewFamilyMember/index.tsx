import {
  BottomSheet,
  Button,
  Card,
  IconTile,
  Text,
  TextField,
} from "@components";
import { useTranslation } from "@presentation/i18n";
import { truncateMiddle } from "@screens/Family/utils/inviteLink";

import useAddNewFamilyMemberViewModel from "./hooks/useAddNewFamilyMemberViewModel";

const LINK_MAX = 36;

function AddNewFamilyMemberModal() {
  const { t } = useTranslation();
  const vm = useAddNewFamilyMemberViewModel();

  if (vm.link) {
    return (
      <BottomSheet
        closeLabel={t("common.actions.close")}
        footer={
          <Button.Secondary
            fullWidth
            label={t("family.member.invite.done")}
            onPress={vm.onDone}
            size="lg"
            testID="invite-done"
          />
        }
        onClose={vm.onClose}
        presentation="inline"
        subtitle={vm.familyName}
        testID="invite-sheet"
        title={t("family.card.invite")}
        visible
      >
        <IconTile name="check" size="lg" tone="income" />
        <Text.Heading
          testID="invite-result-title"
          value={t("family.member.invite.successTitle")}
        />
        <Text.Body
          tone="secondary"
          value={t("family.member.invite.successMessage", {
            email: vm.resultEmail,
          })}
        />
        <Card padding="sm">
          <Text.Caption value={t("family.member.invite.linkLabel")} />
          <Text.Body
            numberOfLines={1}
            testID="invite-link"
            value={truncateMiddle(vm.link, LINK_MAX)}
          />
        </Card>
        <Button.Primary
          fullWidth
          icon={vm.copied ? "check" : "content-copy"}
          label={
            vm.copied
              ? t("family.member.invite.copied")
              : t("family.member.invite.copyLink")
          }
          onPress={vm.onCopy}
          testID="invite-copy"
        />
        {vm.shareAvailable ? (
          <Button.Ghost
            fullWidth
            icon="share-variant-outline"
            label={t("family.member.invite.share")}
            onPress={vm.onShare}
            testID="invite-share"
          />
        ) : null}
      </BottomSheet>
    );
  }

  let error: string | undefined;
  if (vm.emailErrorKey) {
    error = t(vm.emailErrorKey);
  } else if (vm.hasGenericError) {
    error = t("common.errors.generic");
  }

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        <Button.Primary
          fullWidth
          label={t("family.member.invite.submit")}
          loading={vm.isSubmitting}
          onPress={vm.onSubmit}
          size="lg"
          testID="invite-submit"
        />
      }
      onClose={vm.onClose}
      presentation="inline"
      subtitle={vm.familyName}
      testID="invite-sheet"
      title={t("family.card.invite")}
      visible
    >
      <TextField
        autoCapitalize="none"
        autoComplete="email"
        error={error}
        helper={t("family.member.invite.helper")}
        keyboardType="email-address"
        label={t("family.member.invite.emailLabel")}
        onChangeText={vm.onChangeEmail}
        onSubmitEditing={vm.onSubmit}
        returnKeyType="done"
        testID="invite-email"
        textContentType="emailAddress"
        value={vm.email}
      />
    </BottomSheet>
  );
}

export default AddNewFamilyMemberModal;
