"use strict";
/**
 * Content script for OpenQuiz premium-blur remover.
 *
 * openquiz.ai gates premium content behind two different components:
 *
 *   1. The "lock card": a <div class="relative cursor-pointer group"> that
 *      wraps a blurred content div plus an absolutely-positioned overlay
 *      holding the lock icon. Both the blur and the overlay must go.
 *
 *   2. The inline blurred definition: a bare
 *      <span class="blur-sm cursor-pointer">meaning; meaning; meaning</span>
 *      inside the "noun - /prəˈnaʊns/ - <definitions>" line. There is no
 *      lock overlay here — only the blur.
 *
 * So the script does two independent passes:
 *   - strip `blur-sm` from EVERY element that carries it (covers both cases,
 *     plus any future component that reuses the same class), and
 *   - remove the lock overlay from cards that actually contain the lock SVG.
 *
 * A MutationObserver re-runs the cleanup whenever the page DOM changes,
 * because openquiz.ai is a SPA and re-renders cards on interaction. It also
 * watches `class` attributes, so a re-render that re-adds `blur-sm` to an
 * existing element is undone too.
 */
/** CSS selector for the lock-overlay card container. */
const CARD_SELECTOR = "div.relative.cursor-pointer.group";
/** Class name we must strip wherever it appears. */
const BLUR_CLASS = "blur-sm";
/** Selector for any element still carrying the blur class. */
const BLUR_SELECTOR = `.${BLUR_CLASS}`;
/** Class names that uniquely identify the lock-overlay wrapper div. */
const OVERLAY_CLASSES = [
    "absolute",
    "inset-0",
    "flex",
    "items-center",
    "justify-center",
];
/** Selector for the lock-overlay wrapper div. */
const OVERLAY_SELECTOR = OVERLAY_CLASSES.map((c) => `.${c}`).join("");
/** Selector used to locate the lock SVG (defensive: confirms we have the right card). */
const LOCK_SVG_SELECTOR = "svg.lucide-lock";
/**
 * Strips `blur-sm` from every element that has it, anywhere on the page.
 *
 * This intentionally does not care which component the element belongs to:
 * the blurred definition <span>, the blurred example <div> inside a lock
 * card, and any other component openquiz.ai blurs later are all handled by
 * the same pass. Idempotent.
 */
function removeAllBlur(root = document) {
    const blurred = root.querySelectorAll(BLUR_SELECTOR);
    blurred.forEach((el) => el.classList.remove(BLUR_CLASS));
    return blurred.length;
}
/**
 * Returns true if the given card element actually contains the lock overlay
 * we want to remove (defensive: avoids touching unrelated cards).
 */
function isPremiumCard(card) {
    return (card.querySelector(OVERLAY_SELECTOR) !== null &&
        card.querySelector(LOCK_SVG_SELECTOR) !== null);
}
/**
 * Removes the lock-icon overlay from every premium card so the card becomes
 * interactive again. Idempotent.
 */
function removeLockOverlays(root = document) {
    root.querySelectorAll(CARD_SELECTOR).forEach((card) => {
        if (!isPremiumCard(card)) {
            return;
        }
        const overlay = card.querySelector(OVERLAY_SELECTOR);
        if (overlay && overlay.parentElement === card) {
            overlay.remove();
        }
    });
}
/** Runs both cleanup passes against the current DOM. */
function unlockPage() {
    removeAllBlur();
    removeLockOverlays();
}
/**
 * Returns true if the given mutation might have (re-)introduced premium
 * gating we need to clean up: either a newly added subtree containing a
 * blurred element / lock card, or a `class` attribute change that put
 * `blur-sm` back on an existing element.
 */
function mutationNeedsCleanup(mutation) {
    if (mutation.type === "attributes") {
        return (mutation.target instanceof Element &&
            mutation.target.classList.contains(BLUR_CLASS));
    }
    if (mutation.type !== "childList") {
        return false;
    }
    for (const node of Array.from(mutation.addedNodes)) {
        if (!(node instanceof Element)) {
            continue;
        }
        if (node.matches?.(BLUR_SELECTOR) ||
            node.matches?.(CARD_SELECTOR) ||
            node.querySelector?.(BLUR_SELECTOR) ||
            node.querySelector?.(CARD_SELECTOR)) {
            return true;
        }
    }
    return false;
}
/** Bootstraps the cleanup + observer as soon as the document is ready. */
function bootstrap() {
    unlockPage();
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutationNeedsCleanup(mutation)) {
                unlockPage();
                break;
            }
        }
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
    });
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
}
else {
    bootstrap();
}
