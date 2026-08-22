# OpenQuiz Premium Remover

Chrome extension (Manifest V3, TypeScript) that automatically removes the
"premium blur + lock icon" overlay on every
[`openquiz.ai/*`](https://openquiz.ai/) page, so
definitions and examples are readable without a paid account.

## What it does

For every card on a study-set page that is gated behind the paywall:

1. Removes the `blur-sm` class from the inner content `<div>` (the text
   becomes legible).
2. Hides the sibling overlay `<div>` that wraps the lock icon while leaving
   the React-owned node in place (the card becomes interactive again without
   breaking later renders).

The script installs a `MutationObserver` on `document.documentElement`, so it
keeps working even if the SPA replaces its `<body>`. A companion CSS fallback
also removes the visual blur and hides lock overlays immediately while a new
question is being rendered.

## Install (load unpacked)

1. Build the extension:
   ```bash
   npm install
   npm run build
   ```
2. Open `chrome://extensions`.
3. Toggle **Developer mode** on (top right).
4. Click **Load unpacked** and select this project directory.
5. Open any `https://openquiz.ai/*` URL — the previously
   blurred text should now be readable and the lock icon should be gone.

## Development

```bash
npm run watch   # rebuild dist/content.js on every change to src/content.ts
```

After the watcher rebuilds, click the refresh icon on the extension card
in `chrome://extensions` to reload it, then refresh the openquiz.ai tab.

## Project layout

```
manifest.json          MV3 manifest
content.css            Persistent SPA-safe blur/overlay fallback
src/content.ts         Content script (TypeScript)
dist/content.js        Built artifact loaded by Chrome
tsconfig.json          TypeScript config
package.json           Dev tooling only — no runtime dependencies
```

## License

Personal use only.
