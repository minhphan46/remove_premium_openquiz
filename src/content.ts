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
 *   - mark every overlay descendant (the `absolute inset-0 ...` wrapper
 *     around the lock icon) as hidden.
 *
 * We deliberately keep the overlay node in the DOM instead of removing a
 * React-owned node. Removing it can desynchronise React's virtual DOM and is
 * the reason cleanup may stop working after several questions.
 *
 * A MutationObserver watches the document element (not the initial body) and
 * re-runs a coalesced cleanup after every relevant DOM update. The companion
 * content.css is a permanent fallback, so newly rendered content is readable
 * even before the observer callback runs or if the SPA replaces its body.
 */

/** CSS selector for the lock-overlay card container. */
const CARD_SELECTOR = "div.relative.cursor-pointer.group";

/** Class name we must strip wherever it appears. */
const BLUR_CLASS = "blur-sm";

/** Selector for any element still carrying the blur class. */
const BLUR_SELECTOR = `.${BLUR_CLASS}`;

/** Class names that identify the lock-overlay wrapper div (in any order). */
const OVERLAY_CLASS_NAMES = [
    "absolute",
    "inset-0",
    "flex",
    "items-center",
    "justify-center",
] as const;

/** Selector that matches any element carrying all five overlay classes. */
const OVERLAY_SELECTOR = OVERLAY_CLASS_NAMES.map((c) => `.${c}`).join("");

/** Selector used to locate the lock SVG (defensive: confirms we have the right card). */
const LOCK_SVG_SELECTOR = "svg.lucide-lock";

/** Attribute used by content.css to hide an overlay without deleting it. */
const UNLOCKED_OVERLAY_ATTRIBUTE = "data-openquiz-unlocked-overlay";

/**
 * Strips `blur-sm` from every element that has it, anywhere on the page.
 *
 * This intentionally does not care which component the element belongs to:
 * the blurred definition <span>, the blurred example <div> inside a lock
 * card, and any other component openquiz.ai blurs later are all handled by
 * the same pass. Idempotent.
 */
function removeAllBlur(root: ParentNode = document): number {
    const blurred = root.querySelectorAll(BLUR_SELECTOR);
    blurred.forEach((el) => el.classList.remove(BLUR_CLASS));
    return blurred.length;
}

/**
 * Returns true if the given card element actually contains the lock SVG
 * (defensive: avoids touching unrelated cards).
 */
function isPremiumCard(card: Element): boolean {
    return card.querySelector(LOCK_SVG_SELECTOR) !== null;
}

/**
 * Marks every lock-icon overlay descendant as hidden so the card becomes
 * interactive again. The node stays in place to avoid breaking React's DOM
 * bookkeeping. Idempotent.
 */
function hideLockOverlays(root: ParentNode = document): number {
    let hiddenCount = 0;

    root.querySelectorAll(CARD_SELECTOR).forEach((card) => {
        if (!isPremiumCard(card)) {
            return;
        }
        const overlays = card.querySelectorAll(OVERLAY_SELECTOR);
        overlays.forEach((overlay) => {
            if (overlay.querySelector(LOCK_SVG_SELECTOR) === null) {
                return;
            }
            overlay.setAttribute(UNLOCKED_OVERLAY_ATTRIBUTE, "");
            hiddenCount += 1;
        });
    });

    return hiddenCount;
}

/** Runs both cleanup passes against the current DOM. */
function unlockPage(): void {
    removeAllBlur();
    hideLockOverlays();
}

/** Bootstraps the cleanup + observer as soon as the document is ready. */
function bootstrap(): void {
    unlockPage();

    let cleanupScheduled = false;
    const scheduleCleanup = (): void => {
        if (cleanupScheduled) {
            return;
        }

        cleanupScheduled = true;
        queueMicrotask(() => {
            cleanupScheduled = false;
            unlockPage();
        });
    };

    const observer = new MutationObserver((mutations) => {
        const pageChanged = mutations.some(
            (mutation) =>
                mutation.type === "attributes" ||
                (mutation.type === "childList" && mutation.addedNodes.length > 0),
        );

        if (pageChanged) {
            scheduleCleanup();
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
    bootstrap();
}
