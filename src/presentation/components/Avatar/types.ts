export interface AvatarBaseProps extends AvatarBase {
  mode: "icon" | "image" | "text";
  size: "large" | "regular" | "small";
}

export type AvatarProps = AvatarIcon | AvatarImage | AvatarText;

interface AvatarBase {
  source: string;
}

interface AvatarIcon extends AvatarBase {
  mode: "icon";
}

interface AvatarImage extends AvatarBase {
  mode: "image";
}

interface AvatarText extends AvatarBase {
  mode: "text";
}
