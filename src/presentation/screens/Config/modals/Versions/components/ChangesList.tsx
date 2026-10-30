import { View } from "react-native";

import { Badge, Divider, Text } from "@components";
import { ChangelogSectionType } from "@domain/entities/version/VersionEntity";
import { useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { useBreakpoint, useTheme } from "@presentation/theme";

import { useVersionsViewModel } from "../hooks";
import versionsTestIds from "../testIds";

type Changes = NonNullable<ReturnType<typeof useVersionsViewModel>["changes"]>;

const SECTION_LABEL: Record<ChangelogSectionType, TranslationKeys> = {
  ADDED: "versions.changes.added",
  CHANGED: "versions.changes.changed",
  FIXED: "versions.changes.fixed",
  REMOVED: "versions.changes.removed",
  SECURITY: "versions.changes.security",
};
const SECTION_TONE = {
  ADDED: "income",
  CHANGED: "accent",
  FIXED: "expense",
  REMOVED: "warning",
  SECURITY: "warning",
} as const;

// "What changed": every release newer than the running version, newest first (spec 056).
// Wide screens put version + date on the left and the notes on the right.
function ChangesList({ changes }: { changes: Changes }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const wide = useBreakpoint() !== "compact";
  const { spacing } = theme.sizes;

  return (
    <View style={{ gap: spacing.md }} testID={versionsTestIds.changes}>
      <Text.Caption
        tone="secondary"
        value={t("versions.changes.running", { version: changes.running })}
      />
      {changes.releases.length === 0 ? (
        <Text.Body tone="secondary" value={t("versions.changes.empty")} />
      ) : null}
      {changes.releases.map((release, index) => (
        <View key={release.version} style={{ gap: spacing.md }}>
          {index > 0 ? <Divider /> : null}
          <View
            style={{
              flexDirection: wide ? "row" : "column",
              gap: wide ? spacing.xl : spacing.sm,
            }}
          >
            <View style={{ gap: spacing.xxs, width: wide ? 160 : undefined }}>
              <Text.Heading value={release.version} />
              <Text.Caption tone="secondary" value={release.date} />
              {index === 0 ? (
                <Badge label={t("versions.changes.latest")} tone="accent" />
              ) : null}
            </View>
            <View style={{ flex: 1, gap: spacing.md }}>
              {release.sections.map((section) => (
                <View key={section.type} style={{ gap: spacing.xxs }}>
                  <Text.Overline
                    tone={SECTION_TONE[section.type]}
                    value={t(SECTION_LABEL[section.type])}
                  />
                  {section.items.map((item) => (
                    <Text.Body key={item} value={`• ${item}`} />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
      ))}
      {changes.truncated ? (
        <Text.Caption
          testID={versionsTestIds.truncated}
          tone="secondary"
          value={t("versions.changes.truncated")}
        />
      ) : null}
    </View>
  );
}

export default ChangesList;
