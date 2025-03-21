import { View } from "react-native";

import GoogleLogo from "@assets/svgs/GoogleLogo.svg";
import { Button } from "@components";
import { useTranslation } from "@presentation/i18n";

import getStyles from "./styles";
interface Props {
  onPress: () => void;
}

function GoogleButton({ onPress }: Props) {
  const { t } = useTranslation();
  const styles = getStyles();

  return (
    <View style={styles.container}>
      <Button.Outlined
        customStyles={{
          backgroundColor: "#FFFFFF",
          textColor: "#1F1F1F",
        }}
        icon={GoogleIcon}
        label={t("login.button.googleLogin")}
        onPress={onPress}
        testID={"login_googleButton"}
      />
    </View>
  );
}

function GoogleIcon() {
  return <GoogleLogo height={20} width={20} />;
}

export default GoogleButton;
