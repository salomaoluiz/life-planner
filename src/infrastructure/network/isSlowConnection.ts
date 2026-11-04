interface NetworkInformation {
  effectiveType?: string;
  saveData?: boolean;
}

// Web only (`navigator.connection`): the user asked to save data, or the link is 2g or slower. Native has no such
// signal, so it answers false there.
function isSlowConnection() {
  const connection = (
    globalThis.navigator as undefined | { connection?: NetworkInformation }
  )?.connection;

  return (
    !!connection?.saveData ||
    connection?.effectiveType === "2g" ||
    connection?.effectiveType === "slow-2g"
  );
}

export default isSlowConnection;
