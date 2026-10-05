import { Avatar, Touchable } from "@components";

import { useProfileButtonViewModel } from "./hooks";

export interface ProfileButtonProps {
  name?: string;
  photoUrl?: string;
}

function ProfileButton(props: ProfileButtonProps) {
  const { label, onPress } = useProfileButtonViewModel();

  return (
    <Touchable
      accessibilityLabel={label}
      accessibilityRole={"button"}
      onPress={onPress}
      testID={"home-profile-button"}
    >
      <Avatar
        name={props.name}
        photoUrl={props.photoUrl}
        size={"md"}
        testID={"home-profile-avatar"}
      />
    </Touchable>
  );
}

export default ProfileButton;
