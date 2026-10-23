// Maestro runScript (GraalJS). Builds the card CSV of the spec 048 import flows and outputs CSV_FRAGMENT (see
// csv-import-fixture.js) and INVOICE_MONTH (YYYY-MM): one purchase of 1.000,00, a refund of 12,00, a prepayment
// discount of 3,00 and the payment of the invoice (985,00 unless PAYMENT is set), all on the invoice of last month.
// Env: DESCRIPTION, CATEGORY (expense category), ACCOUNT_NAME, CARD_TITLE; optional PAYMENT ("985,00").
// EARLY="true": the file is a purchase of 1.000,00, the same early payment of 300,00 twice (the second looks like a
// duplicate) and the payment of the invoice (400,00 unless PAYMENT is set).
function pad(value) {
  return value < 10 ? "0" + value : String(value);
}
var now = new Date();
var last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
var invoice = pad(last.getMonth() + 1) + "/" + last.getFullYear();
var first = "01/" + invoice;
var today =
  pad(now.getDate()) + "/" + pad(now.getMonth() + 1) + "/" + now.getFullYear();
var payment =
  typeof PAYMENT !== "undefined" && PAYMENT !== ""
    ? PAYMENT
    : typeof EARLY !== "undefined" && EARLY === "true"
      ? "400,00"
      : "985,00";

function row(date, description, type, amount, category, account) {
  return [
    date,
    description,
    type,
    amount,
    category,
    account,
    CARD_TITLE,
    invoice,
  ].join(";");
}

var early = typeof EARLY !== "undefined" && EARLY === "true";
var lines = early
  ? [
      row(first, DESCRIPTION, "Despesa", "1.000,00", CATEGORY, ""),
      row(
        first,
        "Adiantamento fatura",
        "Receita",
        "300,00",
        "Pagamento adiantado",
        ACCOUNT_NAME,
      ),
      row(
        first,
        "Adiantamento fatura",
        "Receita",
        "300,00",
        "Pagamento adiantado",
        ACCOUNT_NAME,
      ),
      row(
        today,
        "Pagamento fatura",
        "Despesa",
        payment,
        "Pagamento de fatura",
        ACCOUNT_NAME,
      ),
    ]
  : [
      row(first, DESCRIPTION, "Despesa", "1.000,00", CATEGORY, ""),
      row(first, "Estorno loja", "Receita", "12,00", "Estorno", ""),
      row(
        first,
        "Desconto parcelas",
        "Receita",
        "3,00",
        "Desconto de adiantamento",
        "",
      ),
      row(
        today,
        "Pagamento fatura",
        "Despesa",
        payment,
        "Pagamento de fatura",
        ACCOUNT_NAME,
      ),
    ];

var csv = ["Data;Descrição;Tipo;Valor;Categoria;Conta;Cartão;Fatura"]
  .concat(lines)
  .join("\r\n");

output.CSV_FRAGMENT = "name=fatura.csv&csv=" + encodeURIComponent(csv);
output.INVOICE_MONTH = last.getFullYear() + "-" + pad(last.getMonth() + 1);
