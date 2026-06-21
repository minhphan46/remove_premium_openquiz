# OpenQuiz Premium Remover

Chrome extension (Manifest V3, TypeScript) that automatically removes the
"premium blur + lock icon" overlay on
[`openquiz.ai/study-set/*`](https://openquiz.ai/study-set/) pages, so
definitions and examples are readable without a paid account.

## What it does

For every card on a study-set page that is gated behind the paywall:

1. Removes the `blur-sm` class from the inner content `<div>` (the text
   becomes legible).
2. Removes the sibling overlay `<div>` that wraps the lock icon (the card
   becomes interactive again).

The script also installs a `MutationObserver` on `document.body`, so any
cards that are rendered later (e.g. when you flip a card, open a new
section, or scroll) are also cleaned up automatically.

## Install (load unpacked)

1. Build the extension:
   ```bash
   npm install
   npm run build
   ```
2. Open `chrome://extensions`.
3. Toggle **Developer mode** on (top right).
4. Click **Load unpacked** and select this project directory.
5. Open any `https://openquiz.ai/study-set/{number}` URL — the previously
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
src/content.ts         Content script (TypeScript)
dist/content.js        Built artifact loaded by Chrome
tsconfig.json          TypeScript config
package.json           Dev tooling only — no runtime dependencies
```

## License

Personal use only.
