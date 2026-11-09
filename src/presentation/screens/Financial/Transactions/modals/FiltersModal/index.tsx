import { AdaptiveLayout } from "@components";

import useFiltersModalViewModel from "./useFiltersModalViewModel";
import { Wide } from "./views";
import { FiltersModalParams } from "./vm";

function FiltersModal(props: FiltersModalParams) {
  const vm = useFiltersModalViewModel(props);

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default FiltersModal;
