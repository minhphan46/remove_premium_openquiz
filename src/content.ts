/**
 * Content script for OpenQuiz premium-blur remover.
 *
 * For every <div class="relative cursor-pointer group"> on a
 * https://openquiz.ai/study-set/{n} page that contains the lock SVG overlay,
 * this script:
 *   1. Removes the `blur-sm` class from the inner
 *      <div class="blur-sm select-none pointer-events-none"> so the text is
 *      readable.
 *   2. Removes the sibling overlay div (the one with class
 *      "absolute inset-0 flex items-center justify-center" that wraps the
 *      lock icon) so the user can interact with the card.
 *
 * A MutationObserver re-runs the cleanup whenever the page DOM changes,
 * because openquiz.ai is a SPA and re-renders cards on interaction.
 */

/** CSS selector for the card container we care about. */
const CARD_SELECTOR = "div.relative.cursor-pointer.group";

/** Class name we must strip from the inner content wrapper. */
const BLUR_CLASS = "blur-sm";

/** Class names that uniquely identify the lock-overlay wrapper div. */
const OVERLAY_CLASSES = [
  "absolute",
  "inset-0",
  "flex",
  "items-center",
  "justify-center",
];

/** Selectors used to locate the lock SVG (defensive: confirms we have the right card). */
const LOCK_SVG_SELECTOR = "svg.lucide-lock";

/**
 * Returns true if the given card element actually contains the lock overlay
 * we want to remove (defensive: avoids touching unrelated cards).
 */
function isPremiumCard(card: Element): boolean {
  return card.querySelector(OVERLAY_CLASSES.map((c) => `.${c}`).join("")) !== null
    && card.querySelector(LOCK_SVG_SELECTOR) !== null;
}

/**
 * Removes the premium blur and lock overlay from one card. Idempotent —
 * safe to call multiple times on the same card.
 */
function unlockCard(card: Element): void {
  // 1. Strip "blur-sm" from the inner content wrapper.
  const blurred = card.querySelector(`.${BLUR_CLASS}`);
  if (blurred) {
    blurred.classList.remove(BLUR_CLASS);
  }

  // 2. Remove the overlay div (the one containing the lock icon).
  const overlay = card.querySelector(
    OVERLAY_CLASSES.map((c) => `.${c}`).join("")
  );
  if (overlay && overlay.parentElement === card) {
    overlay.remove();
  }
}

/** Runs the cleanup against every card currently in the DOM. */
function unlockAllCards(): void {
  const cards = document.querySelectorAll(CARD_SELECTOR);
  cards.forEach((card) => {
    if (isPremiumCard(card)) {
      unlockCard(card);
    }
  });
}

/**
 * Returns true if the given mutation might have added new premium cards we
 * need to clean up. We only need to react to added nodes — attribute
 * changes on existing nodes are handled by the next MutationObserver tick
 * for free.
 */
function mutationTouchesCardSubtree(mutation: MutationRecord): boolean {
  if (mutation.type !== "childList") {
    return false;
  }
  for (const node of Array.from(mutation.addedNodes)) {
    if (!(node instanceof Element)) {
      continue;
    }
    if (node.matches?.(CARD_SELECTOR) || node.querySelector?.(CARD_SELECTOR)) {
      return true;
    }
  }
  return false;
}

/** Bootstraps the cleanup + observer as soon as the document is ready. */
function bootstrap(): void {
  unlockAllCards();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutationTouchesCardSubtree(mutation)) {
        unlockAllCards();
        break;
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
} else {
  bootstrap();
}
