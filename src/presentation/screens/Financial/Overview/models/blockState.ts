// The state of a dashboard block from its query: an error shows only that block's retry (spec 046 FR 19).
function blockState(query: {
  data?: unknown;
  status: string;
}): "error" | "loading" | "ready" {
  if (query.status === "error") {
    return "error";
  }

  return query.data ? "ready" : "loading";
}

export default blockState;
