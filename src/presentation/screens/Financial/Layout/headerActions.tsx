import {
  createContext,
  ReactNode,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type SetActions = (actions: ReactNode) => void;

const ActionsContext = createContext<ReactNode>(undefined);
// Separate context for the setter: a section that registers actions never re-renders when the slot changes.
const SetActionsContext = createContext<SetActions>(() => undefined);

// Spec 050: the Finances header (owned by the layout) has a slot a section can fill, e.g. Transactions' "More actions".
function FinancialHeaderActionsProvider(props: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode>();

  return (
    <SetActionsContext.Provider value={setActions}>
      <ActionsContext.Provider value={actions}>
        {props.children}
      </ActionsContext.Provider>
    </SetActionsContext.Provider>
  );
}

// Registers `actions` in the header while the calling section is mounted. The slot is only refreshed when `version`
// changes (put everything the node renders from in it): the node is a new element on every render, so following it
// would re-render the section in a loop.
function useFinancialHeaderActions(actions: ReactNode, version: string) {
  const setActions = useContext(SetActionsContext);
  const latest = useRef(actions);
  latest.current = actions;

  useLayoutEffect(() => {
    setActions(latest.current);
  }, [setActions, version]);
  useLayoutEffect(() => () => setActions(undefined), [setActions]);
}

function useFinancialHeaderActionsNode() {
  return useContext(ActionsContext);
}

export {
  FinancialHeaderActionsProvider,
  useFinancialHeaderActions,
  useFinancialHeaderActionsNode,
};
