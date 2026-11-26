import { useMemo } from "react";
import { View } from "react-native";

import { Button, QrCode, Text } from "@components";
import { locationLink } from "@domain/entities/stock/locationLink";
import { locationQrPrintHtml } from "@domain/entities/stock/locationQrPrint";
import { printHtml } from "@infrastructure/print";
import { qrMatrix } from "@infrastructure/qrcode";
import { shareText } from "@infrastructure/share";
import { useTranslation } from "@presentation/i18n";

interface Props {
  location: { id: string; name: string };
}

// The web host of the app (`EXPO_PUBLIC_PROJECT_WEBSITE_URL`); on the web the page's own origin is the fallback.
export function webBase(): string | undefined {
  // Direct read is inlined by Expo at build time; the alias keeps it readable at runtime (tests).
  const envs = process.env;
  const configured =
    process.env.EXPO_PUBLIC_PROJECT_WEBSITE_URL ??
    envs.EXPO_PUBLIC_PROJECT_WEBSITE_URL;

  if (configured) {
    return configured;
  }

  return typeof window !== "undefined" ? window.location?.origin : undefined;
}

// Spec 117 FR 19 / spec 125 FR 7: the QR of the link of the location with Share and Print; used by the QR sheet and
// by the location modal.
function LocationQrPanel({ location }: Props) {
  const { t } = useTranslation();
  const link = locationLink(webBase(), location.id);
  const matrix = useMemo(() => qrMatrix(link), [link]);

  return (
    <View style={{ gap: 12 }}>
      <View style={{ alignItems: "center" }}>
        <QrCode
          accessibilityLabel={t("stock.location.qrTitle")}
          matrix={matrix}
          testID="stock.location.qr.code"
        />
        <Text.BodyStrong value={location.name} />
      </View>
      <Button.Secondary
        label={t("stock.location.share")}
        onPress={() =>
          void shareText(
            t("stock.location.shareMessage", { link, name: location.name }),
          )
        }
        testID="stock.location.qr.share"
      />
      <Button.Primary
        label={t("stock.location.print")}
        onPress={() =>
          void printHtml(
            locationQrPrintHtml({
              hint: t("stock.location.printHint"),
              matrix,
              name: location.name,
            }),
          )
        }
        testID="stock.location.qr.print"
      />
    </View>
  );
}

export default LocationQrPanel;
