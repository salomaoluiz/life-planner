import GoogleLogo from "@assets/svgs/GoogleLogo.svg";
import { Button } from "@components";
import { useTranslation } from "@presentation/i18n";

interface Props {
  onPress: () => void;
}

function GoogleButton({ onPress }: Props) {
  const { t } = useTranslation();

  return (
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
  );
}

function GoogleIcon() {
  return <GoogleLogo height={20} width={20} />;
}

export default GoogleButton;
