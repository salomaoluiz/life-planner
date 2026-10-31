# Changelog

All notable changes to this project are documented here, newest first.
Format: [Keep a Changelog](https://keepachangelog.com).

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
