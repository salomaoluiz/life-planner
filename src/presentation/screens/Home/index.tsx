import { ScrollView, View } from "react-native";

import { ScreenHeader } from "@components";
import { useTranslation } from "@presentation/i18n";
import { StockDashboard } from "@screens/Home/containers";
import ProfileButton from "@screens/Navigation/containers/ProfileButton";

import getStyles from "./styles";

function Home() {
  const styles = getStyles();
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View testID={"home-header"}>
        <ScreenHeader
          actions={<ProfileButton />}
          title={t("navigation.tabs.home")}
        />
      </View>
      <StockDashboard />
    </ScrollView>
  );
}

export default Home;
