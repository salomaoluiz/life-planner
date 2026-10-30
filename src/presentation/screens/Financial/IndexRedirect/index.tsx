import { Redirect } from "expo-router";

// Old URL `/financial` (bookmarks, links) now lives at `/financial/transaction`.
function FinancialIndexRedirect() {
  return <Redirect href={"/financial/transaction" as never} />;
}

export default FinancialIndexRedirect;
