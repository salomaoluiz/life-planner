// Android versionCode derived from the SemVer in package.json: major*10000 + minor*100 + patch.
function versionCode(version) {
  const [major, minor, patch] = version.split(".").map(Number);

  return major * 10000 + minor * 100 + patch;
}

module.exports = { versionCode };
