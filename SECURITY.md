# Security Policy

## Supported Versions
This is a single-page static app with no versioned releases. The latest commit on `main` is always the supported version.

## Reporting a Vulnerability
If you discover a security issue (e.g. an XSS vector, unsafe use of third-party APIs, or exposed credentials), please open a private security advisory via GitHub's "Report a vulnerability" feature under the Security tab, rather than filing a public issue.

We'll aim to acknowledge reports within 5 business days.

## Scope Notes
- This app calls public weather/geocoding APIs client-side; no API keys or secrets should ever be committed to this repo.
- Geolocation data is used only in-browser and is never transmitted to any server other than the weather API itself.
