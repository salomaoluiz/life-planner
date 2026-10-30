import { View } from "react-native";

import { Card, Chip, IconTile, SwitchRow, Text } from "@components";
import { ApplyPreviewRow } from "@screens/Financial/Categories/modals/NewCategoryModal/models/applyToSubcategories";
import categoryFormTestIds from "@screens/Financial/Categories/modals/NewCategoryModal/testIds";

import useStyles from "./styles";

interface Props {
  colorOn: boolean;
  colorSwitchVisible: boolean;
  compact: boolean;
  description: string;
  iconOn: boolean;
  iconSwitchVisible: boolean;
  labels: {
    archivedSuffix: string;
    colorHint: string;
    colorSwitch: string;
    iconHint: string;
    iconSwitch: string;
    keeps: string;
    offHint: string;
    preview: string;
    root: string;
    title: string;
  };
  onColorToggle: () => void;
  onIconToggle: () => void;
  preview: ApplyPreviewRow[];
  toneLabel: (number: number) => string;
}

function ApplyToSubcategories(props: Props) {
  const { indent, styles } = useStyles();
  const anyOn = props.colorOn || props.iconOn;

  function renderPreview() {
    return (
      <View style={styles.section} testID={categoryFormTestIds.applyPreview}>
        <Text.Caption tone={"secondary"} value={props.labels.preview} />
        {props.preview.map((row) => (
          <View
            key={row.id}
            style={[
              styles.previewRow,
              indent(row.depth),
              row.archived && styles.archived,
            ]}
          >
            <IconTile color={row.tint} name={row.icon} size={"sm"} />
            <View style={styles.name}>
              <Text.Body
                value={`${row.name}${row.archived ? ` ${props.labels.archivedSuffix}` : ""}`}
              />
            </View>
            <Text.Caption tone={"secondary"} value={tagOf(row, props)} />
          </View>
        ))}
      </View>
    );
  }

  function renderChips() {
    if (!anyOn) {
      return <Text.Caption tone={"secondary"} value={props.labels.offHint} />;
    }

    return (
      <View style={styles.chips} testID={categoryFormTestIds.applyPreview}>
        {props.preview
          .filter((row) => row.depth > 0)
          .map((row) => (
            <Chip
              colorDot={row.tint}
              disabled
              key={row.id}
              label={row.name}
              onPress={() => undefined}
            />
          ))}
      </View>
    );
  }

  return (
    <Card padding={"md"} testID={categoryFormTestIds.applyToChildren}>
      <View style={styles.root}>
        <View style={styles.section}>
          <Text.BodyStrong value={props.labels.title} />
          {!props.compact && (
            <Text.Caption tone={"secondary"} value={props.description} />
          )}
        </View>
        {props.colorSwitchVisible && (
          <SwitchRow
            hint={props.compact ? undefined : props.labels.colorHint}
            label={props.labels.colorSwitch}
            onToggle={props.onColorToggle}
            testID={categoryFormTestIds.applyColorSwitch}
            value={props.colorOn}
          />
        )}
        {props.iconSwitchVisible && (
          <SwitchRow
            hint={props.compact ? undefined : props.labels.iconHint}
            label={props.labels.iconSwitch}
            onToggle={props.onIconToggle}
            testID={categoryFormTestIds.applyIconSwitch}
            value={props.iconOn}
          />
        )}
        {props.compact ? renderChips() : renderPreview()}
      </View>
    </Card>
  );
}

function tagOf(row: ApplyPreviewRow, props: Props) {
  if (row.depth === 0) {
    return props.labels.root;
  }

  return row.tone === undefined
    ? props.labels.keeps
    : props.toneLabel(row.tone);
}

export default ApplyToSubcategories;
