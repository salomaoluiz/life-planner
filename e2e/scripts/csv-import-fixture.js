// Maestro runScript (GraalJS). Builds the CSV the import flows load (spec 047) and outputs CSV_FRAGMENT, the URL
// fragment of the dev-only /e2e-csv route (`name=<file>&csv=<url-encoded text>`): the browser file chooser cannot be
// driven by Maestro, so the route leaves the file for the wizard's next pick.
// Env: DESCRIPTION_1, DESCRIPTION_2, CATEGORY_1, CATEGORY_2 and, optionally, ACCOUNT_NAME (adds the Conta column).
// Both rows are dated today (dd/mm/yyyy), so they land in the month the list opens on.
function pad(value) {
  return value < 10 ? "0" + value : String(value);
}
var now = new Date();
var today =
  pad(now.getDate()) + "/" + pad(now.getMonth() + 1) + "/" + now.getFullYear();
var withAccount = typeof ACCOUNT_NAME !== "undefined" && ACCOUNT_NAME !== "";
var header = "Data;Descrição;Valor;Categoria" + (withAccount ? ";Conta" : "");

function row(description, amount, category) {
  return (
    today +
    ";" +
    description +
    ";" +
    amount +
    ";" +
    category +
    (withAccount ? ";" + ACCOUNT_NAME : "")
  );
}

var csv = [
  header,
  row(DESCRIPTION_1, "-312,40", CATEGORY_1),
  row(DESCRIPTION_2, "-39,90", CATEGORY_2),
].join("\r\n");

output.CSV_FRAGMENT = "name=extrato.csv&csv=" + encodeURIComponent(csv);
