# Changelog

All notable changes to this project are documented here, newest first.
Format: [Keep a Changelog](https://keepachangelog.com).

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
