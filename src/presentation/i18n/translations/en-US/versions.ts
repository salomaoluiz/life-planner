const versions = {
  action: {
    back: "Back",
    checkNow: "Check now",
    close: "Close",
    reload: "Reload now",
    viewRelease: "View release {{version}}",
    whatChanged: "What changed",
  },
  banner: {
    apk: "App {{latest}} was released. This APK is {{current}}.",
    dismiss: "Dismiss notice",
    reload: "A new app version ({{version}}) is live. Reload to update.",
    viewRelease: "View release",
  },
  card: {
    api: "API",
    appAndroid: "APP (ANDROID)",
    appIos: "APP (IOS)",
    appWeb: "APP (WEB)",
  },
  changes: {
    added: "Added",
    changed: "Changed",
    empty: "No newer versions.",
    fixed: "Fixed",
    latest: "Latest",
    openGithub: "View on GitHub",
    removed: "Removed",
    running: "Running {{version}}",
    security: "Security",
    titleApi: "What's new in the API",
    titleApp: "What's new in the app",
    truncated: "Showing the 10 most recent versions",
  },
  checkedAgo: "Checked {{time}} ago",
  checkedNever: "Not checked",
  env: {
    development: "Development",
    production: "Production",
    staging: "Staging",
  },
  field: {
    build: "Build",
    latest: "Latest on GitHub",
    liveSince: "Live since",
    liveVersion: "Live",
    released: "Released",
  },
  footer: "App {{app}} · API {{api}}",
  hint: {
    apiPending:
      "Version {{version}} is published on GitHub but not deployed to the API yet.",
    apkBehind: "Version {{version}} was released. This APK is older.",
    appPending:
      "Version {{version}} is published on GitHub but not deployed yet.",
    reload:
      "Version {{version}} is already live on the server. This tab still runs the previous one.",
  },
  status: {
    apiDown: "API unavailable",
    apkBehind: "APK out of date",
    deployPending: "Deploy pending",
    reload: "Reload",
    unknown: "Not checked",
    updates_one: "1 update",
    updates_other: "{{count}} updates",
    upToDate: "Up to date",
  },
  timeAgo: {
    days: "{{count}} d",
    hours: "{{count}} h",
    minutes: "{{count}} min",
    now: "less than a minute",
  },
  title: "Versions",
  unavailableValue: "—",
};

export default versions;
