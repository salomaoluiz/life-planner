// Maestro runScript (GraalJS). Converts an asset into another existing one through the API (spec 112).
// Reads E2E_API_URL, TOKEN, ASSET_ID (the origin), DESTINATION_ID, RATIO_FROM and RATIO_TO from env, plus the optional
// caller-scoped param DATE (today default). Never logs the token.
function param(value, fallback) {
  return typeof value !== "undefined" && value !== "" ? value : fallback;
}
function today() {
  var now = new Date();
  var month = String(now.getMonth() + 1);
  var day = String(now.getDate());

  return (
    now.getFullYear() +
    "-" +
    (month.length < 2 ? "0" + month : month) +
    "-" +
    (day.length < 2 ? "0" + day : day)
  );
}
var response = http.post(
  E2E_API_URL + "/v1/investments/assets/" + ASSET_ID + "/conversions",
  {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },
    body: JSON.stringify({
      date: param(typeof DATE === "undefined" ? undefined : DATE, today()),
      destination: { assetId: DESTINATION_ID },
      ratioFrom: RATIO_FROM,
      ratioTo: RATIO_TO,
    }),
  },
);
if (!response.ok) {
  throw new Error(
    "E2E setup: conversion failed with status " + response.status,
  );
}

var item = json(response.body).item;

output.CONVERSION_ID = item.id;
output.CONVERSION_IN_ID = item.to.operationId;
output.CONVERSION_OUT_ID = item.from.operationId;
