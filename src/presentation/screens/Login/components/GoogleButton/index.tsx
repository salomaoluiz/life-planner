import { Button } from "@components";

import GoogleLogo from "@assets/svgs/GoogleLogo.svg";
import { useTranslation } from "@presentation/i18n";

interface Props {
  onPress: () => void;
}

function GoogleButton({ onPress }: Props) {
  const { t } = useTranslation();

  function GoogleIcon() {
    return <GoogleLogo height={20} width={20} />;
  }

  return (
    <Button.Outlined
      testID={"login_googleButton"}
      icon={GoogleIcon}
      label={t("login.button.googleLogin")}
      onPress={onPress}
      customStyles={{
        textColor: "#1F1F1F",
        backgroundColor: "#FFFFFF",
      }}
    />
  );
}

export default GoogleButton;
