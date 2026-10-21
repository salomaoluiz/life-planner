// Maestro runScript (GraalJS). Builds the CSV the import flows load (spec 047) and outputs CSV_FRAGMENT, the URL
// fragment of the dev-only /e2e-csv route (`name=<file>&csv=<url-encoded text>`): the browser file chooser cannot be
// driven by Maestro, so the route leaves the file for the wizard's next pick.
// Optional OWNER_1 / OWNER_2 add the "Pertence a" column (the owner of each row).
// Env: DESCRIPTION_1, DESCRIPTION_2, CATEGORY_1, CATEGORY_2 and, optionally, ACCOUNT_NAME (adds the Conta column).
// AMOUNT_2 (optional, default -39,90) sets the second row's signed amount. Both rows are dated today (dd/mm/yyyy), so they land in the month the list opens on.
function pad(value) {
  return value < 10 ? "0" + value : String(value);
}
var now = new Date();
var today =
  pad(now.getDate()) + "/" + pad(now.getMonth() + 1) + "/" + now.getFullYear();
var withAccount = typeof ACCOUNT_NAME !== "undefined" && ACCOUNT_NAME !== "";
var withOwner = typeof OWNER_1 !== "undefined" && OWNER_1 !== "";
var header =
  "Data;Descrição;Valor;Categoria" +
  (withAccount ? ";Conta" : "") +
  (withOwner ? ";Pertence a" : "");

function row(description, amount, category, owner) {
  return (
    today +
    ";" +
    description +
    ";" +
    amount +
    ";" +
    category +
    (withAccount ? ";" + ACCOUNT_NAME : "") +
    (withOwner ? ";" + owner : "")
  );
}

var csv = [
  header,
  row(DESCRIPTION_1, "-312,40", CATEGORY_1, withOwner ? OWNER_1 : ""),
  row(
    DESCRIPTION_2,
    typeof AMOUNT_2 !== "undefined" && AMOUNT_2 !== "" ? AMOUNT_2 : "-39,90",
    CATEGORY_2,
    withOwner ? OWNER_2 : "",
  ),
].join("\r\n");

output.CSV_FRAGMENT = "name=extrato.csv&csv=" + encodeURIComponent(csv);
