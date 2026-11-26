import { BottomSheet } from "@components";
import { useTranslation } from "@presentation/i18n";
import LocationQrPanel from "@screens/Stock/containers/LocationQrPanel";

interface Props {
  location: { id: string; name: string };
  onClose: () => void;
}

// Spec 117 FR 19: the QR of the link of the location, shared or printed from the device.
function LocationQrSheet({ location, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      onClose={onClose}
      testID="stock.location.qr.sheet"
      title={t("stock.location.qrTitle")}
      visible
    >
      <LocationQrPanel location={location} />
    </BottomSheet>
  );
}

export default LocationQrSheet;
