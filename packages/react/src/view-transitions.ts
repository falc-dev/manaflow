export type ViewTransitionCallback = () => void;

interface ViewTransitionDocument {
  startViewTransition?: (callback: ViewTransitionCallback) => unknown;
}

function getViewTransitionDocument(): ViewTransitionDocument | undefined {
  return globalThis.document as ViewTransitionDocument | undefined;
}

export function runWithOptionalViewTransition(callback: ViewTransitionCallback): void {
  const doc = getViewTransitionDocument();
  if (doc && typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(callback);
    return;
  }

  callback();
}

export function getReplayCardViewTransitionName(entityId: string): string {
  const normalized = entityId.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const prefixed = /^[a-z_]/.test(normalized) ? normalized : `card-${normalized}`;
  return `replay-card-${prefixed}`;
}
