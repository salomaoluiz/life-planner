import { Pressable, View } from "react-native";

import {
  Button,
  Card,
  ConfirmDialog,
  getAvatarTone,
  IconTile,
  Text,
} from "@components";
import { IconButton } from "@components/Icon";
import { useTranslation } from "@presentation/i18n";
import * as Components from "@screens/Family/components";
import FamilyViewModel from "@screens/Family/models/FamilyViewModel";

import useFamilyCardViewModel from "./hooks/useFamilyCardViewModel";
import useStyles from "./styles";

interface Props {
  expanded: boolean;
  family: FamilyViewModel;
  onToggle: () => void;
}

function FamilyCard(props: Props) {
  const { family } = props;
  const { t } = useTranslation();
  const { styles } = useStyles();
  const vm = useFamilyCardViewModel({ family });
  const subtitle = family.subtitle;

  return (
    <Card testID={`family-card-${family.familyId}`}>
      <View style={styles.body}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: props.expanded }}
          onPress={props.onToggle}
          style={styles.header}
          testID={`family-card-toggle-${family.familyId}`}
        >
          <IconTile
            label={family.initial}
            size="lg"
            tone={getAvatarTone(family.familyName)}
          />
          <View style={styles.headerText}>
            <Text.Heading numberOfLines={1} value={family.familyName} />
            <Text.Caption
              numberOfLines={1}
              value={t(subtitle.key, subtitle.params)}
            />
          </View>
          {family.menuAction ? (
            <IconButton
              accessibilityLabel={t("family.card.optionsFor", {
                name: family.familyName,
              })}
              name="dots-horizontal"
              onPress={vm.onFamilyOptions}
              testID={`family-card-options-${family.familyId}`}
            />
          ) : null}
        </Pressable>

        {props.expanded ? (
          <>
            <Text.Overline value={t("family.card.members")} />
            <View>
              {family.familyMembers.map((member, index) => (
                <Components.MemberRow
                  badge={
                    member.statusLabelKey && member.statusTone
                      ? {
                          label: t(member.statusLabelKey),
                          tone: member.statusTone,
                        }
                      : undefined
                  }
                  divider={index < family.familyMembers.length - 1}
                  isPending={member.isPending}
                  key={member.id}
                  name={member.avatar.name}
                  onOptionsPress={
                    member.action ? () => vm.onMemberOptions(member) : undefined
                  }
                  optionsLabel={t("family.card.optionsFor", {
                    name: member.displayName,
                  })}
                  photoUrl={member.avatar.photoUrl}
                  subtitle={member.isPending ? undefined : member.email}
                  testID={`member-row-${member.id}`}
                  title={
                    member.isCurrentUser
                      ? t("family.card.you")
                      : member.displayName
                  }
                />
              ))}
            </View>
            {family.isOwner ? (
              <Button.Secondary
                fullWidth
                icon="account-plus-outline"
                label={t("family.card.invite")}
                onPress={vm.onInviteMember}
                testID={`invite-member-${family.familyId}`}
              />
            ) : null}
          </>
        ) : null}
      </View>

      <Components.ActionSheet
        actionLabel={vm.menu ? t(vm.menu.actionLabelKey) : ""}
        closeLabel={t("common.actions.close")}
        onAction={vm.onMenuAction}
        onClose={vm.onCloseMenu}
        subtitle={vm.menu?.subtitle ?? ""}
        testID={`family-menu-${family.familyId}`}
        title={vm.menu ? t(vm.menu.titleKey) : ""}
        visible={!!vm.menu}
      />
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={vm.confirmCopy ? t(vm.confirmCopy.confirmLabelKey) : ""}
        loading={vm.isBusy}
        message={vm.confirmCopy ? t(vm.confirmCopy.messageKey) : ""}
        onCancel={vm.onCancelConfirm}
        onConfirm={vm.onConfirm}
        testID={`family-confirm-${family.familyId}`}
        title={
          vm.confirmCopy
            ? t(vm.confirmCopy.titleKey, vm.confirmCopy.params)
            : ""
        }
        visible={!!vm.confirm}
      />
      <Components.NoticeSheet
        closeLabel={t("common.actions.close")}
        message={
          vm.notice === "DELETE_BLOCKED"
            ? t("family.deleteBlocked.message")
            : undefined
        }
        okLabel={
          vm.notice === "DELETE_BLOCKED"
            ? t("family.deleteBlocked.close")
            : t("family.card.ok")
        }
        onClose={vm.onCloseNotice}
        testID={`family-notice-${family.familyId}`}
        title={
          vm.notice === "DELETE_BLOCKED"
            ? t("family.deleteBlocked.title")
            : t("common.errors.generic")
        }
        visible={!!vm.notice}
      />
    </Card>
  );
}

export default FamilyCard;
