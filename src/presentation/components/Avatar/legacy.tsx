import React from "react";

import { AvatarBaseProps, AvatarProps } from "./types";
import { getAvatarComponent, getAvatarSize } from "./utils";

function AvatarBase(props: AvatarBaseProps) {
  const Component = getAvatarComponent(props);
  const size = getAvatarSize(props.size);

  return <Component {...props} size={size} />;
}

function Large(props: AvatarProps) {
  return <AvatarBase {...props} size={"large"} />;
}

function Regular(props: AvatarProps) {
  return <AvatarBase {...props} size={"regular"} />;
}

function Small(props: AvatarProps) {
  return <AvatarBase {...props} size={"small"} />;
}

export { Large, Regular, Small };
export { AvatarProps } from "./types";
