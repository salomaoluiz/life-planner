import { View } from "react-native";

import { Card, Screen, ScreenHeader } from "@components";
import { useTranslation } from "@presentation/i18n";

import { Language, Logout, Theme } from "./containers";
import useStyles from "./styles";

function Config() {
  const { styles } = useStyles();
  const { t } = useTranslation();

  return (
    <Screen scroll testID="settings">
      <ScreenHeader title={t("configurations.routeTitle")} />
      <Card padding="lg" testID="settings-card">
        <View style={styles.fields}>
          <Theme />
          <Language />
        </View>
      </Card>
      <View style={styles.logout}>
        <Logout />
      </View>
    </Screen>
  );
}

export default Config;
