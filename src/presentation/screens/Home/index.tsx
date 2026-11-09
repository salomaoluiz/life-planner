import { AdaptiveLayout } from "@components";

import { useHomeViewModel } from "./hooks";
import { Wide } from "./views";

function Home() {
  const vm = useHomeViewModel();

  return <AdaptiveLayout vm={vm} wide={Wide} />;
}

export default Home;
