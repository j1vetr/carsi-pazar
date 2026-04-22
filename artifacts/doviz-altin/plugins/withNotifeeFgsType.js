const { withAndroidManifest } = require("@expo/config-plugins");

const NOTIFEE_FG_SERVICE = "app.notifee.core.ForegroundService";
const FG_TYPE = "dataSync";

function withNotifeeFgsType(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults?.manifest?.application?.[0];
    if (!app) return cfg;

    let services = app.service ?? [];
    if (!Array.isArray(services)) services = [services];

    const idx = services.findIndex(
      (s) => s?.$?.["android:name"] === NOTIFEE_FG_SERVICE,
    );

    if (idx === -1) {
      services.push({
        $: {
          "android:name": NOTIFEE_FG_SERVICE,
          "android:foregroundServiceType": FG_TYPE,
        },
      });
    } else {
      services[idx] = {
        ...services[idx],
        $: {
          ...(services[idx].$ ?? {}),
          "android:foregroundServiceType": FG_TYPE,
        },
      };
    }

    app.service = services;
    return cfg;
  });
}

module.exports = withNotifeeFgsType;
