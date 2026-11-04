import { Profiler } from "react";

import { render } from "@tests";

interface Options {
  // Lets the pending requests settle before the first reading.
  settle?: () => Promise<void>;
  wrapper?: React.FunctionComponent<{ children: React.ReactElement }>;
}

// Renders the element under a `<Profiler>`; `commits()` counts the React commits since `mark()` (or the mount).
async function countCommits(element: React.ReactElement, options?: Options) {
  let count = 0;
  const view = render(
    <Profiler
      id={"render-budget"}
      onRender={() => {
        count += 1;
      }}
    >
      {element}
    </Profiler>,
    options?.wrapper ? { wrapper: options.wrapper } : undefined,
  );

  await options?.settle?.();

  return {
    commits: () => count,
    mark: () => {
      count = 0;
    },
    view,
  };
}

export { countCommits };
