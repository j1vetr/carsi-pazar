# Çarşı Pazar — Firebase Functions

Backend for the Çarşı Pazar / Canlı Döviz & Altın mobile app.

## Functions

- **getPrices** (HTTPS) — `https://europe-west1-carsi-pazar-16191.cloudfunctions.net/getPrices` — proxies HaremAPI with an 8s shared cache (Firestore `prices/latest`). Mobile app hits this instead of HaremAPI directly.
- **pollPrices** (Scheduler) — runs every 1 minute, refreshes `prices/latest` and checks all active alerts. Triggered alerts mark themselves inactive and send Expo push to the device's stored token.

## Secrets

```bash
firebase functions:secrets:set HAREMAPI_KEY
# paste the key, ENTER
```

## Deploy

From repo root:

```bash
firebase login                   # one time
firebase deploy --only functions,firestore:rules,firestore:indexes
```

## Firestore layout

- `prices/latest` — `{ ts, items: HaremPrice[] }`
- `tokens/{deviceId}` — `{ expoPushToken, platform, updatedAt }`
- `alerts/{alertId}` — `{ deviceId, code, type: 'above'|'below', target, currency, active, createdAt }`

## Local emulator

```bash
cd functions && npm install && npm run build
firebase emulators:start --only functions,firestore
```
