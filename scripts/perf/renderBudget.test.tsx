import { useEffect, useState } from "react";

import { countCommits } from "../../tests/perf/renderBudget";

function Toggle() {
  const [on, setOn] = useState(false);

  useEffect(() => setOn(true), []);

  return on ? null : null;
}

it("SHOULD count the commits of a mount and reset on mark", async () => {
  const { commits, mark, view } = await countCommits(<Toggle />);

  expect(commits()).toBe(2);
  mark();
  expect(commits()).toBe(0);
  view.unmount();
});
