const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withAdIdPermission(config) {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;

    if (!manifest["uses-permission"]) {
      manifest["uses-permission"] = [];
    }

    const PERMISSION = "com.google.android.gms.permission.AD_ID";
    const already = manifest["uses-permission"].some(
      (p) => p.$["android:name"] === PERMISSION
    );

    if (!already) {
      manifest["uses-permission"].push({ $: { "android:name": PERMISSION } });
    }

    return mod;
  });
};
