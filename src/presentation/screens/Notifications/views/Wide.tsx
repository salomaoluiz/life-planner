import { View } from "react-native";

import {
  AdaptiveViewProps,
  Badge,
  Button,
  Card,
  ChipGroup,
  ColorDot,
  EmptyState,
  ErrorState,
  IconButton,
  Screen,
  ScreenHeader,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";

import NotificationPermissionCard from "../containers/NotificationPermissionCard";
import { NotificationsVM } from "../hooks";
import { NoticeRow } from "../models/NoticeUIModel";
import useStyles from "../styles";
import notificationsTestIds from "../testIds";

const GROUP_KEYS = {
  DUE_TODAY: "notifications.group.dueToday",
  OVERDUE: "notifications.group.overdue",
  UPCOMING: "notifications.group.upcoming",
} as const;

function Wide({ vm }: AdaptiveViewProps<NotificationsVM>) {
  const { styles, theme } = useStyles();
  const { t } = useTranslation();

  function renderRow(row: NoticeRow) {
    const open = vm.selectedId === row.id;

    return (
      <Card
        accessibilityLabel={row.title}
        key={row.id}
        onPress={() => vm.onNoticePress(row)}
        testID={`${notificationsTestIds.notice}-${row.id}`}
      >
        <View style={styles.noticeHead}>
          {row.isUnread ? (
            <ColorDot color={theme.colors.accent} size={8} />
          ) : null}
          <View style={styles.noticeText}>
            <Text.BodyStrong value={row.title} />
            <Text.Caption
              tone="secondary"
              value={`${row.time} · ${t(pluralKey("notifications.itemCount", row.itemCount), { count: row.itemCount })}`}
            />
          </View>
          {row.isUrgent ? (
            <Badge label={t("notifications.group.dueToday")} tone="expense" />
          ) : null}
        </View>
        {open ? (
          <View style={styles.notices}>
            {row.groups.map((group) => (
              <View key={group.state} style={styles.group}>
                <Text.Caption
                  tone={group.state === "DUE_TODAY" ? "expense" : "secondary"}
                  value={t(GROUP_KEYS[group.state])}
                />
                {group.items.map((item) => (
                  <Button.Ghost
                    inline
                    key={item.key}
                    label={`${item.label}${item.detail ? ` · ${item.detail}` : ""}${item.dueLabel ? ` · ${item.dueLabel}` : ""}`}
                    onPress={() => vm.onItemPress(item.route)}
                  />
                ))}
              </View>
            ))}
          </View>
        ) : null}
      </Card>
    );
  }

  function renderBody() {
    if (vm.isLoading) {
      return <Skeleton.ListItem testID={notificationsTestIds.loading} />;
    }

    if (vm.errorKey) {
      return (
        <ErrorState
          message={t(vm.errorKey)}
          onRetry={vm.onRetry}
          retryLabel={t("common.actions.tryAgain")}
          testID={notificationsTestIds.error}
        />
      );
    }

    if (vm.allTypesOff) {
      return (
        <EmptyState
          actionLabel={t("notifications.allOffAction")}
          icon="bell-off-outline"
          message={t("notifications.allOff")}
          onAction={vm.onSettingsPress}
          testID={notificationsTestIds.allOff}
          title={t("notifications.title")}
        />
      );
    }

    if (vm.isEmpty) {
      return (
        <EmptyState
          icon="bell-outline"
          message={t("notifications.empty")}
          testID={notificationsTestIds.empty}
          title={t("notifications.title")}
        />
      );
    }

    return (
      <View style={styles.list}>
        {vm.days.map((day) => (
          <View
            key={day.key}
            style={styles.day}
            testID={`${notificationsTestIds.day}-${day.key}`}
          >
            <Text.Caption tone="secondary" value={day.label} />
            {day.rows.map((row) => renderRow(row))}
          </View>
        ))}
        {vm.hasNext ? (
          <Button.Secondary
            disabled={vm.isLoadingMore}
            label={t("notifications.loadMore")}
            onPress={vm.onLoadMore}
            testID={notificationsTestIds.loadMore}
          />
        ) : null}
        <Text.Caption tone="secondary" value={t("notifications.footer")} />
      </View>
    );
  }

  return (
    <Screen maxWidth={960} scroll testID={notificationsTestIds.screen}>
      <ScreenHeader
        actions={
          <View style={styles.toolbar}>
            <Button.Ghost
              disabled={vm.unreadCount === 0}
              inline
              label={t("notifications.markAllRead")}
              onPress={vm.onMarkAllRead}
              testID={notificationsTestIds.markAll}
            />
            <IconButton
              accessibilityLabel={t("notifications.openSettings")}
              name="cog-outline"
              onPress={vm.onSettingsPress}
              testID={notificationsTestIds.settingsButton}
            />
          </View>
        }
        title={t("notifications.title")}
      />
      <NotificationPermissionCard />
      <ChipGroup
        mode="single"
        onChange={vm.onFilterChange}
        options={[
          { label: t("notifications.filter.all"), value: "all" },
          {
            label: t("notifications.filter.unread", { count: vm.unreadCount }),
            value: "unread",
          },
          { label: t("notifications.filter.stock"), value: "STOCK" },
          { label: t("notifications.filter.finance"), value: "FINANCE" },
        ]}
        testID={notificationsTestIds.filter}
        value={vm.filter}
      />
      {renderBody()}
    </Screen>
  );
}

export default Wide;
