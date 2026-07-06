# Contributing to Almanac — Weather

Thanks for considering a contribution! This is a small, single-file project, so the process is intentionally lightweight.

## Getting started
1. Fork the repo and clone your fork.
2. Open `index.html` directly in a browser, or serve it locally:
   ```bash
   python3 -m http.server 8000
   ```
3. Make your changes. There's no build step — it's plain HTML/CSS/JS.

## Submitting changes
1. Create a branch: `git checkout -b fix/short-description`.
2. Commit with a clear message.
3. Push and open a pull request against `main`.
4. Describe what you changed and why in the PR description.

## Guidelines
- Keep it dependency-free where possible; this project intentionally has no build tools.
- Match the existing code style (2-space indentation, descriptive variable names).
- Test in at least one desktop and one mobile browser before submitting.
- If you change visual design, include a before/after screenshot in the PR.

## Reporting bugs
Please open an issue using the bug report template and include steps to reproduce, browser/OS, and screenshots if relevant.
