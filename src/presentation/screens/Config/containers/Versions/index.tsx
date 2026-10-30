import { router } from "expo-router";
import { View } from "react-native";

import { Badge, Text, Touchable } from "@components";
import useVersionInfo from "@presentation/hooks/useVersionInfo";
import {
  environmentKey,
  statusChip,
} from "@presentation/hooks/useVersionInfo/labels";
import { useTranslation } from "@presentation/i18n";

import settingsTestIds from "../../testIds";
import useStyles from "./styles";

// "App X · API Y · Production" plus a status chip; opens the Versions modal (spec 056).
function Versions() {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const { info, runningVersion, status } = useVersionInfo();
  const chip = statusChip(status);
  const apiVersion = info?.api.current ?? t("versions.unavailableValue");
  const environment = info?.environment;

  return (
    <Touchable
      accessibilityLabel={t("versions.title")}
      accessibilityRole="button"
      onPress={() => router.push("/versions" as never)}
      style={styles.pill}
      testID={settingsTestIds.versionsFooter}
    >
      <View style={styles.row}>
        <Text.Caption
          tone="secondary"
          value={t("versions.footer", { api: apiVersion, app: runningVersion })}
        />
        {environment === "STAGING" ? (
          <Badge
            label={t(environmentKey(environment))}
            testID={settingsTestIds.versionsEnvironment}
            tone="warning"
          />
        ) : null}
        {environment && environment !== "STAGING" ? (
          <Text.Caption
            testID={settingsTestIds.versionsEnvironment}
            tone="secondary"
            value={`· ${t(environmentKey(environment))}`}
          />
        ) : null}
        <Badge
          label={t(chip.key, { count: chip.count })}
          testID={settingsTestIds.versionsStatus}
          tone={chip.tone}
        />
      </View>
    </Touchable>
  );
}

export default Versions;
