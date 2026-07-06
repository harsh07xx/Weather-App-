# Almanac — Weather

A single-page weather app with a warm, almanac-inspired design (brass/paper color palette, Fraunces + Inter + IBM Plex Mono fonts).

## Features
- Auto-detects your location via browser geolocation
- Falls back to New Delhi, India if location access is denied
- Reverse geocoding for place names
- Clean, self-contained — just one HTML file, no build step

## Usage
Just open `index.html` in a browser, or serve it locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy with GitHub Pages
1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under "Build and deployment", set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)`.
4. Your app will be live at `https://YOUR_USERNAME.github.io/weather-app/`.

## Tech
- Vanilla HTML/CSS/JS
- No dependencies, no build tools required
