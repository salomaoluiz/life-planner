import { ScrollView, StyleSheet, View } from "react-native";

import { Divider, Text } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";

interface Props {
  headers: string[];
  rows: string[][];
  testID?: string;
}

const CELL_WIDTH = 140;

// The header and the first rows of the file, scrollable sideways (spec 047 FR 11).
function PreviewTable(props: Props) {
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    cell: { paddingVertical: spacing.xs, width: CELL_WIDTH },
    row: { flexDirection: "row", gap: spacing.xs },
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator testID={props.testID}>
      <View>
        <View style={styles.row}>
          {props.headers.map((header, column) => (
            <View key={`${header}-${column}`} style={styles.cell}>
              <Text.BodyStrong numberOfLines={1} value={header} />
            </View>
          ))}
        </View>
        {props.rows.map((row, index) => (
          <View key={index}>
            <Divider />
            <View
              style={styles.row}
              testID={props.testID && `${props.testID}-row-${index}`}
            >
              {props.headers.map((_, column) => (
                <View key={column} style={styles.cell}>
                  <Text.Caption numberOfLines={1} value={row[column] ?? ""} />
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default PreviewTable;
