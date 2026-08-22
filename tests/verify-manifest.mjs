import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile("manifest.json", "utf8"));
const [contentScript] = manifest.content_scripts ?? [];

assert.ok(contentScript, "manifest must declare a content script");
assert.deepEqual(
    contentScript.matches,
    ["https://openquiz.ai/*"],
    "content script must run on every HTTPS path of openquiz.ai",
);

await Promise.all([
    ...contentScript.js.map((path) => access(path)),
    ...contentScript.css.map((path) => access(path)),
]);

console.log("manifest coverage: https://openquiz.ai/*");
