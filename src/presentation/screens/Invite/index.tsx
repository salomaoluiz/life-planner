import { AdaptiveLayout } from "@components";

import useInviteViewModel from "./hooks/useInviteViewModel";
import { Wide } from "./views";

function Invite() {
  const vm = useInviteViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default Invite;
