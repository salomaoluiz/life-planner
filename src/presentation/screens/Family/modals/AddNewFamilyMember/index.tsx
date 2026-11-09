import { AdaptiveLayout } from "@components";

import useAddNewFamilyMemberViewModel from "./hooks/useAddNewFamilyMemberViewModel";
import { Wide } from "./views";

function AddNewFamilyMemberModal() {
  const vm = useAddNewFamilyMemberViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default AddNewFamilyMemberModal;
