import { Text } from "@components";
import useVersionInfo from "@presentation/hooks/useVersionInfo";
import { environmentKey } from "@presentation/hooks/useVersionInfo/labels";
import { useTranslation } from "@presentation/i18n";

import loginTestIds from "../testIds";

// Plain "App X · API Y · Environment" text: no chip, no modal (spec 056).
function VersionLine() {
  const { t } = useTranslation();
  const { info, runningVersion } = useVersionInfo();
  const line = t("versions.footer", {
    api: info?.api.current ?? t("versions.unavailableValue"),
    app: runningVersion,
  });
  const environment = info ? ` · ${t(environmentKey(info.environment))}` : "";

  return (
    <Text.Caption
      align="center"
      testID={loginTestIds.versions}
      tone="secondary"
      value={`${line}${environment}`}
    />
  );
}

export default VersionLine;
