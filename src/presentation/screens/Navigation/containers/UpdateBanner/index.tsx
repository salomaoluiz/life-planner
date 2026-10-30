import { Linking, View } from "react-native";

import { StatusBanner } from "@components";
import { reloadApp } from "@infrastructure/appInfo";
import useVersionInfo from "@presentation/hooks/useVersionInfo";
import { useTranslation } from "@presentation/i18n";
import { useTheme } from "@presentation/theme";

// Top of every signed-in screen (spec 056): "reload the web app" or "your APK is behind".
function UpdateBanner() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { banner, dismiss } = useVersionInfo();

  if (!banner) {
    return null;
  }

  const isReload = banner.kind === "RELOAD";
  const { url } = banner;

  function onAction() {
    if (isReload) {
      reloadApp();
    } else if (url) {
      void Linking.openURL(url);
    }
  }

  return (
    <View
      style={{
        paddingHorizontal: theme.sizes.spacing.md,
        paddingTop: theme.sizes.spacing.sm,
      }}
    >
      <StatusBanner
        actionLabel={
          isReload
            ? t("versions.status.reload")
            : t("versions.banner.viewRelease")
        }
        dismissLabel={t("versions.banner.dismiss")}
        icon={isReload ? "refresh" : "download"}
        message={
          isReload
            ? t("versions.banner.reload", { version: banner.version })
            : t("versions.banner.apk", {
                current: banner.current,
                latest: banner.version,
              })
        }
        onAction={isReload || url ? onAction : undefined}
        onDismiss={dismiss}
        testID="navigation.update-banner"
      />
    </View>
  );
}

export default UpdateBanner;
