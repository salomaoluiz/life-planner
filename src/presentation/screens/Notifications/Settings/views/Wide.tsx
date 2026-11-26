import { View } from "react-native";

import {
  AdaptiveViewProps,
  Badge,
  Button,
  Callout,
  Card,
  NumberStepper,
  Picker,
  Screen,
  ScreenHeader,
  Switch,
  SwitchRow,
  Text,
} from "@components";
import { NOTIFICATION_TYPES } from "@domain/entities/notification/NotificationEntity";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { notificationSettingsTestIds } from "@screens/Notifications/testIds";

import { NotificationSettingsVM } from "../hooks";
import useStyles from "../styles";

function Wide({ vm }: AdaptiveViewProps<NotificationSettingsVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { data } = vm;

  function leadDays(type: (typeof NOTIFICATION_TYPES)[number]) {
    return type === "FINANCE_BILL_DUE"
      ? (data?.billLeadDays ?? 3)
      : (data?.invoiceLeadDays ?? 3);
  }

  function renderTypes() {
    return (
      <Card padding="lg">
        <View style={styles.section}>
          <Text.BodyStrong value={t("notifications.settings.types")} />
          {NOTIFICATION_TYPES.map((type) => {
            const isFinance = type.startsWith("FINANCE");

            return (
              <View key={type} style={styles.section}>
                <SwitchRow
                  hint={
                    isFinance
                      ? t(
                          pluralKey(
                            "notifications.settings.daysBefore",
                            leadDays(type),
                          ),
                          { count: leadDays(type) },
                        )
                      : t("notifications.settings.itemWindow")
                  }
                  label={t(`notifications.type.${type}`)}
                  onToggle={(value) => vm.onTypeToggle(type, value)}
                  testID={`${notificationSettingsTestIds.typeSwitch}-${type}`}
                  value={data?.types[type] ?? true}
                />
                {isFinance ? (
                  <View style={styles.leadRow}>
                    <Text.Caption
                      tone="secondary"
                      value={t("notifications.settings.leadDays")}
                    />
                    <NumberStepper
                      accessibilityLabel={t("notifications.settings.leadDays")}
                      decreaseLabel="-"
                      increaseLabel="+"
                      max={30}
                      min={0}
                      onChange={(value) => vm.onLeadDaysChange(type, value)}
                      testID={`${notificationSettingsTestIds.leadDays}-${type}`}
                      value={leadDays(type)}
                    />
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </Card>
    );
  }

  function renderWhen() {
    const items = vm.times.map((time) => ({ label: time, value: time }));

    return (
      <Card padding="lg">
        <View style={styles.section}>
          <Text.BodyStrong value={t("notifications.settings.when")} />
          <Text.Caption
            tone="secondary"
            value={t("notifications.settings.summaryTime")}
          />
          <Picker
            items={items}
            onValueChange={vm.onSummaryTimeChange}
            selectedValue={data?.summaryTime ?? "08:00"}
            testID={notificationSettingsTestIds.summaryTime}
          />
          <Text.Caption
            tone="secondary"
            value={t("notifications.settings.quietFrom")}
          />
          <Picker
            items={items}
            onValueChange={vm.onQuietStartChange}
            selectedValue={data?.quietStart ?? "22:00"}
            testID={notificationSettingsTestIds.quietStart}
          />
          <Text.Caption
            tone="secondary"
            value={t("notifications.settings.quietTo")}
          />
          <Picker
            items={items}
            onValueChange={vm.onQuietEndChange}
            selectedValue={data?.quietEnd ?? "07:00"}
            testID={notificationSettingsTestIds.quietEnd}
          />
          <Text.Caption
            tone="secondary"
            value={`${t("notifications.settings.timeZone")}: ${vm.timeZone}`}
          />
        </View>
      </Card>
    );
  }

  function renderFamilies() {
    if (!data || data.families.length === 0) {
      return null;
    }

    return (
      <Card padding="lg">
        <View style={styles.section}>
          <Text.BodyStrong value={t("notifications.settings.families")} />
          <Text.Caption
            tone="secondary"
            value={t("notifications.settings.familiesHint")}
          />
          {data.families.map((family) => (
            <SwitchRow
              key={family.familyId}
              label={family.name}
              onToggle={(value) => vm.onFamilyToggle(family.familyId, value)}
              testID={`${notificationSettingsTestIds.family}-${family.familyId}`}
              value={family.enabled}
            />
          ))}
        </View>
      </Card>
    );
  }

  function renderDevices() {
    return (
      <Card padding="lg">
        <View style={styles.section}>
          <Text.BodyStrong value={t("notifications.settings.devices")} />
          <Text.Caption
            tone="secondary"
            value={t("notifications.settings.devicesHint")}
          />
          {vm.device.devices.map((item) => (
            <View
              key={item.id}
              style={styles.deviceRow}
              testID={`${notificationSettingsTestIds.device}-${item.id}`}
            >
              <View style={styles.deviceText}>
                <Text.BodyStrong value={item.name} />
                <Text.Caption
                  tone="secondary"
                  value={t(`notifications.settings.platform.${item.platform}`)}
                />
                {item.id === vm.device.deviceId ? (
                  <Badge
                    label={t("notifications.settings.thisDevice")}
                    tone="accent"
                  />
                ) : null}
              </View>
              <View style={styles.deviceActions}>
                <Button.Ghost
                  inline
                  label={t("notifications.settings.remove")}
                  onPress={() => vm.onDeviceRemove(item.id)}
                  testID={`${notificationSettingsTestIds.deviceRemove}-${item.id}`}
                  tone="expense"
                />
                <Switch
                  initialStatus={item.enabled}
                  onToggle={(value) => vm.onDeviceToggle(item.id, value)}
                  testID={`${notificationSettingsTestIds.deviceSwitch}-${item.id}`}
                />
              </View>
            </View>
          ))}
          {!vm.device.isRegistered && vm.device.permission !== "unsupported" ? (
            <Button.Primary
              disabled={vm.device.isEnabling}
              label={t("notifications.settings.enableHere")}
              onPress={vm.onEnableHere}
              testID={notificationSettingsTestIds.enableHere}
            />
          ) : null}
          {vm.device.needsHomeScreenInstall ? (
            <Callout tone="warning">
              <Text.Body value={t("notifications.permission.iosWeb")} />
            </Callout>
          ) : null}
          <Button.Secondary
            disabled={!vm.device.isRegistered}
            label={t("notifications.settings.test")}
            onPress={vm.onTest}
            testID={notificationSettingsTestIds.test}
          />
          {vm.testSent ? (
            <Text.Caption
              tone="secondary"
              value={t("notifications.settings.testSent")}
            />
          ) : null}
        </View>
      </Card>
    );
  }

  return (
    <Screen maxWidth={1100} scroll testID={notificationSettingsTestIds.screen}>
      <ScreenHeader title={t("notifications.settings.title")} />
      {vm.errorKey ? (
        <Callout role="alert" tone="expense">
          <Text.Body value={t(vm.errorKey)} />
        </Callout>
      ) : null}
      <View style={styles.columns}>
        <View style={styles.column}>
          {renderTypes()}
          {renderFamilies()}
        </View>
        <View style={styles.column}>
          {renderWhen()}
          {renderDevices()}
        </View>
      </View>
    </Screen>
  );
}

export default Wide;
