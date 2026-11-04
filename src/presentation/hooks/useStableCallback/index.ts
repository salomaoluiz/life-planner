import { useRef } from "react";

// A function whose identity never changes and that always calls the latest `fn`: handed to memoized list rows, it
// keeps them from re-rendering when the screen re-renders, without the stale closures of a dependency list.
function useStableCallback<Args extends unknown[], Result>(
  fn: (...args: Args) => Result,
) {
  const latest = useRef(fn);
  const stable = useRef((...args: Args) => latest.current(...args));

  latest.current = fn;

  return stable.current;
}

export default useStableCallback;
