# Wethr

A fast, key-free weather app built as a single HTML page, packaged for the web (Docker + nginx), Android (Capacitor) and desktop (Electron).

Forecasts come from [Open-Meteo](https://open-meteo.com/), preferring the Bureau of Meteorology's ACCESS-G model and falling back automatically to Open-Meteo's blended forecast when BOM's feed is unavailable.

## Features

- **Now** — temperature, feels-like, today's high/low, wind, chance and amount of rain, humidity, surface pressure and visibility.
- **Rain by hour** — a scrollable 24-hour chart: bars for rainfall, a line for chance of rain.
- **Weather map** — embedded [Windy](https://www.windy.com/) rain and wind overlays.
- **7-day forecast** and **past 7 days**.
- **Sun & moon** — sunrise/sunset, moon phase and rise/set, and the sun's and moon's real paths across the sky.
- **Rainfall this month / year to date** compared with the 10-year average (Open-Meteo archive).
- **Conditions to note** — alerts for strong gusts (60+ km/h), extreme heat (38°C+), very cold nights (2°C or below) and heavy rain (25+ mm).
- **Tides** — optional, with a free [WorldTides](https://www.worldtides.info/) API key entered in settings.
- Saved locations, device GPS, light/dark themes, and an optional theme that recolours the app for the time of day, sky and temperature.
- Installable as a PWA over HTTPS.

## Project layout

| Path | What it is |
|---|---|
| `weather-app.html` | The whole app: markup, styles and script |
| `sw.js` | Network-first service worker (PWA install and offline fallback) |
| `Dockerfile`, `nginx.conf` | Web deployment: nginx serving HTTPS on 443, redirecting 80 |
| `electron/` | Electron main process and icon generator |
| `android/` | Capacitor Android project |
| `build/icon.png` | App icon used by the desktop builds |

## Running locally

Any static file server works, for example:

```sh
npx http-server -p 8765
```

Then open <http://localhost:8765/weather-app.html>.

## Web deployment (Docker)

The image expects a TLS certificate and key in `certs/` (gitignored) — for local use, generate them with [mkcert](https://github.com/FiloSottile/mkcert):

```sh
mkcert -cert-file certs/weathr.crt -key-file certs/weathr.key localhost 127.0.0.1 <your-hostname>
```

Build and run:

```sh
docker build -t weathr:latest .
docker run -d --name Weathr --restart unless-stopped -p 80:80 -p 443:443 weathr:latest
```

To redeploy after changes, rebuild the image, then `docker rm -f Weathr` and run it again.

## Android

Requires Android Studio (for its JDK) and the Android SDK. Set `JAVA_HOME` to Android Studio's bundled `jbr` and `ANDROID_HOME` to the SDK if they aren't already set.

```sh
npm install
npm run android:sync          # copies weather-app.html into www/ and syncs Capacitor
cd android
./gradlew assembleRelease bundleRelease
```

Outputs land in `android/app/build/outputs/apk/release/` and `android/app/build/outputs/bundle/release/`.

Release signing reads `android/keystore.properties` (gitignored):

```properties
storeFile=<path to your .jks keystore>
storePassword=...
keyAlias=...
keyPassword=...
```

Without it, release builds are produced unsigned.

Install on a connected device with `adb install -r android/app/build/outputs/apk/release/app-release.apk`.

## Desktop (Electron)

```sh
npm install
npm start          # run in development
npm run dist       # build installers into dist/
```

On Windows this produces an NSIS installer and a portable `.exe`. The build config also has macOS (`dmg`) and Linux (`AppImage`) targets.

## Data sources

- Forecast, historical and geocoding data: [Open-Meteo](https://open-meteo.com/) (CC BY 4.0), including the Bureau of Meteorology ACCESS-G model.
- Map: [Windy](https://www.windy.com/) embed.
- Tides: [WorldTides](https://www.worldtides.info/) (optional, bring your own key).
- Moon phase and rise/set are calculated locally and are approximate.

## License

[MIT](LICENSE) © 2026 Andrew Rigney
