import { AdaptiveLayout } from "@components";

import useAddNewFamilyViewModel from "./hooks/useAddNewFamilyViewModel";
import { Wide } from "./views";

function AddNewFamilyModal() {
  const vm = useAddNewFamilyViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default AddNewFamilyModal;
