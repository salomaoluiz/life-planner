import { useTheme } from "@presentation/theme";

import { AvatarIcon, AvatarImage, AvatarText } from "./DTO";
import { AvatarBaseProps } from "./types";

function getAvatarComponent(props: AvatarBaseProps) {
  switch (props.mode) {
    case "icon":
      return AvatarIcon;
    case "image":
      return AvatarImage;
    case "text":
      return AvatarText;
  }
}

function getAvatarSize(size: AvatarBaseProps["size"]) {
  const { theme } = useTheme();

  switch (size) {
    case "large":
      return theme.sizes.spacing.xxlarge;
    case "regular":
      return theme.sizes.spacing.xlarge;
    case "small":
      return theme.sizes.spacing.large;
  }
}
export { getAvatarComponent, getAvatarSize };
