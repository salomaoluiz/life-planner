import { Pressable, View } from "react-native";

import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  getAvatarTone,
  IconTile,
  PendingItemsDialog,
  Text,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import { IconButton } from "@components/Icon";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import * as Components from "@screens/Family/components";
import FamilyViewModel from "@screens/Family/models/FamilyViewModel";
import familyTestIds from "@screens/Family/testIds";

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
  const localeTag = useLocaleTag();

  // What blocks the archive, one section per kind (empty ones are hidden by the dialog).
  function blockerSections() {
    const blockers = vm.blockers;

    if (!blockers) {
      return [];
    }

    return [
      {
        items: blockers.recurrences.map((item) => ({
          id: item.id,
          label: t("family.blockers.recurrencesItem", {
            date: item.nextOccurrenceDate
              ? formatShortDate(item.nextOccurrenceDate, localeTag)
              : "-",
            description: item.description,
          }),
        })),
        title: t("family.blockers.recurrences"),
      },
      {
        items: blockers.installmentPlans.map((item) => ({
          id: item.id,
          label: t(
            pluralKey(
              "family.blockers.installmentsItem",
              item.remainingInstallments,
            ),
            {
              count: item.remainingInstallments,
              description: item.description,
            },
          ),
        })),
        title: t("family.blockers.installments"),
      },
      {
        items: blockers.invoices.map((item) => ({
          id: `${item.creditCardId}-${item.month}`,
          label: t("family.blockers.invoicesItem", {
            amount: formatAmount(item.amountDue, localeTag, DEFAULT_CURRENCY),
            month: item.month,
            name: item.creditCardName,
          }),
        })),
        title: t("family.blockers.invoices"),
      },
      {
        items: blockers.unpaidTransactions.map((item) => ({
          id: item.id,
          label: t("family.blockers.unpaidItem", {
            amount: formatAmount(item.value, localeTag, DEFAULT_CURRENCY),
            date: formatShortDate(item.date, localeTag),
            description: item.description,
          }),
        })),
        title: t("family.blockers.unpaid"),
      },
      {
        items: blockers.pendingInvites.map((item) => ({
          id: item.id,
          label: item.email,
        })),
        title: t("family.blockers.invites"),
      },
    ];
  }

  return (
    <Card testID={`${familyTestIds.card}-${family.familyId}`}>
      <View style={styles.body}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: props.expanded }}
          onPress={props.onToggle}
          style={styles.header}
          testID={`${familyTestIds.cardToggle}-${family.familyId}`}
        >
          <IconTile
            label={family.initial}
            size="lg"
            tone={getAvatarTone(family.familyName)}
          />
          <View style={styles.headerText}>
            <Text.Heading
              numberOfLines={1}
              testID={`${familyTestIds.cardTitle}-${family.familyId}`}
              value={family.familyName}
            />
            <Text.Caption
              numberOfLines={1}
              value={t(subtitle.key, subtitle.params)}
            />
          </View>
          {family.isArchived ? (
            <Badge
              label={t("family.archived.chip")}
              testID={`${familyTestIds.archivedChip}-${family.familyId}`}
              tone="neutral"
            />
          ) : null}
          {family.menuAction ? (
            <IconButton
              accessibilityLabel={t("family.card.optionsFor", {
                name: family.familyName,
              })}
              name="dots-horizontal"
              onPress={vm.onFamilyOptions}
              testID={`${familyTestIds.cardOptions}-${family.familyId}`}
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
                  testID={`${familyTestIds.member}-${member.id}`}
                  title={
                    member.isCurrentUser
                      ? t("family.card.you")
                      : member.displayName
                  }
                />
              ))}
            </View>
            {family.canInvite ? (
              <Button.Secondary
                fullWidth
                icon="account-plus-outline"
                label={t("family.card.invite")}
                onPress={vm.onInviteMember}
                testID={`${familyTestIds.inviteButton}-${family.familyId}`}
              />
            ) : null}
          </>
        ) : null}
        {family.isArchived ? (
          <Text.Caption tone="secondary" value={t("family.archived.note")} />
        ) : null}
        {family.canReactivate ? (
          <View style={styles.inlineActions}>
            <View style={styles.inlineAction}>
              <Button.Primary
                disabled={vm.isBusy}
                fullWidth
                label={t("family.archived.reactivate")}
                onPress={vm.onReactivate}
                testID={`${familyTestIds.reactivateButton}-${family.familyId}`}
              />
            </View>
            <View style={styles.inlineAction}>
              <Button.Destructive
                disabled={vm.isBusy}
                fullWidth
                label={t("family.delete.confirm")}
                onPress={vm.onDeleteInline}
                testID={`${familyTestIds.deleteButton}-${family.familyId}`}
              />
            </View>
          </View>
        ) : null}
      </View>

      <Components.ActionSheet
        actionLabel={vm.menu ? t(vm.menu.actionLabelKey) : ""}
        closeLabel={t("common.actions.close")}
        onAction={vm.onMenuAction}
        onClose={vm.onCloseMenu}
        onSecondaryAction={vm.onMenuSecondaryAction}
        secondaryLabel={
          vm.menu?.secondaryLabelKey ? t(vm.menu.secondaryLabelKey) : undefined
        }
        subtitle={vm.menu?.subtitle ?? ""}
        testID={`${familyTestIds.menu}-${family.familyId}`}
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
        testID={`${familyTestIds.confirm}-${family.familyId}`}
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
        testID={`${familyTestIds.notice}-${family.familyId}`}
        title={
          vm.notice === "DELETE_BLOCKED"
            ? t("family.deleteBlocked.title")
            : t("common.errors.generic")
        }
        visible={!!vm.notice}
      />
      {vm.blockers ? (
        <PendingItemsDialog
          bodyLabel={t("family.blockers.body")}
          closeLabel={t("common.actions.close")}
          okLabel={t("family.blockers.close")}
          onClose={vm.onCloseBlockers}
          sections={blockerSections()}
          testIDs={{
            dialog: `${familyTestIds.blockers}-${family.familyId}`,
            ok: `${familyTestIds.blockersOk}-${family.familyId}`,
          }}
          title={t("family.blockers.title")}
        />
      ) : null}
    </Card>
  );
}

// "2026-11-05" -> "05/11" (parsed from the string, never through a time zone).
function formatShortDate(isoDate: string, localeTag: string) {
  const [year, month, day] = isoDate.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString(localeTag, {
    day: "2-digit",
    month: "2-digit",
  });
}

export default FamilyCard;
