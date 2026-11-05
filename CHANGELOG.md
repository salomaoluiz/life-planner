# Changelog

All notable changes to this project are documented here, newest first.
Format: [Keep a Changelog](https://keepachangelog.com).

## [1.8.0] - 2026-11-05

### Added

- Mark one account as your favorite in the account form. The Overview balance chart draws it as its own line over the total, the daily balance in Transactions shows its balance first (and the total when you open the day), and the Home balance card follows it, with the total of accounts still shown (spec 094).

## [1.7.7] - 2026-11-04

### Changed

- The web app loads faster: each screen and modal downloads only when opened, and the first load is about 20% smaller (spec 089).

## [1.7.6] - 2026-11-04

### Changed

- The transactions list scrolls and updates more smoothly: rows only render again when what they show changes (spec 087).
- After a short pause on a month, the previous and next month load in the background, so switching months shows their rows at once (spec 087).

## [1.7.5] - 2026-11-04

### Changed

- The transactions screen loads a month with one request (rows, card invoices, daily balances, projections and the month totals together) instead of five (spec 080).

## [1.7.4] - 2026-11-04

### Changed

- Transaction lists load smaller responses: each page lists the categories and tags once instead of repeating them in every row (spec 079).

## [1.7.3] - 2026-11-03

### Changed

- Opening a transaction from Home or an invoice reads that one transaction instead of a long period, so it opens faster (spec 077).
- Installment edit, refund and category forms stop loading the recent transactions: the first reads its row by id, the refund only the opened card's purchases, the category form only checks whether it has any (spec 077).

## [1.7.2] - 2026-11-03

### Changed

- Saving, editing or deleting a transaction updates the month in memory and refreshes only the numbers it changes, so totals settle faster and fewer requests are sent (spec 076).
- Importing a CSV refreshes the finance data only, not the whole app (spec 076).

## [1.7.1] - 2026-11-03

### Changed

- The transactions list is read page by page over a period, and a search without a period looks at the last 2 years (spec 078, needs the API 2.0.0).
- The month switcher is no longer hidden behind the last day's balance when the Transactions screen opens.
- Paying a bill refreshes the other months too, so the paid row shows in its new month at once.

## [1.7.0] - 2026-11-03

### Changed

- The transactions screen loads only the month you are looking at instead of your whole history, so it opens much faster with years of data (spec 075).
- Switching month keeps the previous rows with the loading skeleton until the new month arrives (spec 075).
- Description suggestions come from the months you have seen in the session, and "most used categories" ignores rows more than a year ahead (spec 075).

## [1.6.4] - 2026-11-03

### Changed

- Screens that filter by family or personal data open faster: the owners (you and your families) load in one request and every list on the screen starts loading at the same time instead of one after another (spec 074).

## [1.6.3] - 2026-11-03

### Changed

- Faster screens: data seen less than 30 seconds ago is reused when you return to a screen, and identical requests are sent once (spec 073).
- Errors show sooner: failed requests are retried once instead of three times, and reads time out after 10 seconds (spec 073).

## [1.6.2] - 2026-11-02

### Changed

- Internal: request budgets per screen (tests and `yarn perf`) guard against extra or duplicate API calls (spec 067). No change for users.

## [1.6.1] - 2026-11-02

### Fixed

- Privacy: a failed local cache write no longer sends any of your data to the monitoring service (spec 063).
- The app no longer goes blank while your profile refreshes in the background (spec 063).
- Performance tracing now uses the configured sample rate, and the web app loads fewer bytes (smaller bundle, compressed icon font) (spec 063).

## [1.6.0] - 2026-10-31

### Added

- The home has a Finance section: the balance expected at the end of the month (current balance plus what is left to receive and to pay), the day of lowest balance this month and next month with the balance by account, and a list of everything overdue plus the next 7 days (spec 062).
- A card invoice shows as one item in that list, with a "See transactions" button that opens the transactions of that card and month (spec 062).
- The Stock section on the home has a summary card and the list of items that need attention (spec 062).

### Changed

- "Latest transactions" and the month result card are gone from the home (spec 062).

### Fixed

- Deleting a recurring series with "All" shows the paid-occurrences warning on the first try, instead of failing first and asking only on "Try again": recurring deletes keep the form open with a "Saving" button until the server answers (spec 061).
- Creating or deleting two transactions in a row no longer drops the first one's "Saving"/"Deleting" state before the list refreshed (spec 061).

## [1.5.0] - 2026-10-31

### Added

- Creating, editing and deleting a transaction now closes the form at once; the list shows the row as "Saving" or "Deleting" while the server answers, and the totals dim with a spinner (spec 061).
- If a change fails it is undone and a toast offers "Try again", which reopens the form with what you typed (spec 061).
- Installments and recurrences keep the form open with a "Saving" button and blocked fields until the server answers (spec 061).

## [1.4.0] - 2026-10-30

### Added

- While creating a transaction, typing 2+ characters in Description suggests past transactions (one per description, the most recent); picking one fills type, owner, account or card, category and tags (spec 060).

### Fixed

- On the Transactions list, an expanded card invoice no longer stops the scroll at "Open invoice" and its buttons are clickable again; the note tooltip is drawn above the list (specs 059, 060).

## [1.3.1] - 2026-10-30

### Fixed

- The web app no longer re-reads `version.json` in a loop after opening, which made it extremely slow (spec 056).

## [1.3.0] - 2026-10-30

### Added

- Transactions, installment plans and recurring series have an optional Notes field (up to 1000 characters) in the form and in the installment sheet (spec 059).
- Lists show a small note icon on rows that have a note; on the web, hovering it shows the note in up to 2 lines (spec 059).
- The search also finds transactions by notes, category name and amount (spec 059).
- The transactions CSV import maps a Notes column, and the export has one (spec 059).

## [1.2.0] - 2026-10-30

### Added

- Editing a category with subcategories can apply its new color (in tones) and/or icon to all of them, archived included, in one save (spec 058).
- The icon picker searches a catalog of about 250 icons grouped by theme, in Portuguese and English, without accents and with typo tolerance (spec 058).

## [1.1.1] - 2026-10-30

### Fixed

- Pressing F5 (or opening a link) with a form open now keeps the screen it was opened from behind it, and closing it lands on that screen (spec 057).
- Transactions moved to `/financial/transaction`; `/financial` still redirects there (spec 057).
- The "reload" banner on the web app no longer reappears after reloading on the newest version (spec 057).

## [1.1.0] - 2026-10-30

### Added

- Settings shows the app and API versions and warns when an update is available (spec 056).
- A banner asks to reload the web app when a new version is live, and flags an outdated Android APK (spec 056).
