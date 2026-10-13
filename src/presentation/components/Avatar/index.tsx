import AvatarView, { AvatarViewProps } from "./AvatarView";
import { Large, Regular, Small } from "./legacy";

const Avatar = Object.assign(
  (props: AvatarViewProps) => <AvatarView {...props} />,
  {
    /** Legacy, kept until spec 014: use <Avatar size="lg" /> */
    Large,
    /** Legacy, kept until spec 014: use <Avatar size="md" /> */
    Regular,
    /** Legacy, kept until spec 014: use <Avatar size="sm" /> */
    Small,
  },
);

export default Avatar;
export { AvatarViewProps };
export { AvatarProps } from "./legacy";
