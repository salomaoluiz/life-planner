import Svg, { Path, Rect } from "react-native-svg";

import { colors } from "@presentation/theme/constants";

export interface QrCodeProps {
  accessibilityLabel: string;
  /** Rows of dark (true) and light (false) modules */
  matrix: boolean[][];
  /** Side in px. @default 192 */
  size?: number;
  testID?: string;
}

// A scanner needs dark modules on a light square in every theme: always the light palette.
const DARK = colors.light.textPrimary;
const LIGHT = colors.light.surface;
const QUIET_ZONE = 2;
const DEFAULT_SIZE = 192;

// Black modules on a white square, whatever the theme: a scanner needs the contrast (spec 117 FR 19).
function QrCode(props: QrCodeProps) {
  const side = props.matrix.length + QUIET_ZONE * 2;
  const path = props.matrix
    .flatMap((row, y) =>
      row.map((dark, x) =>
        dark ? `M${x + QUIET_ZONE} ${y + QUIET_ZONE}h1v1h-1z` : "",
      ),
    )
    .join("");

  return (
    <Svg
      accessibilityLabel={props.accessibilityLabel}
      height={props.size ?? DEFAULT_SIZE}
      testID={props.testID}
      viewBox={`0 0 ${side} ${side}`}
      width={props.size ?? DEFAULT_SIZE}
    >
      <Rect fill={LIGHT} height={side} width={side} />
      <Path d={path} fill={DARK} />
    </Svg>
  );
}

export default QrCode;
