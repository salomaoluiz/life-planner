const formatters = new Map<string, Intl.DateTimeFormat>();

// One `Intl.DateTimeFormat` per locale and options: building one is costly and the list needs one per day header.
function getDateTimeFormat(
  languageTag: string,
  options: Intl.DateTimeFormatOptions,
) {
  const key = `${languageTag}|${JSON.stringify(options)}`;
  let formatter = formatters.get(key);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(languageTag, options);
    formatters.set(key, formatter);
  }

  return formatter;
}

export { getDateTimeFormat };
