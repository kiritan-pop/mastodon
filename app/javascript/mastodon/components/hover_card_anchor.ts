export const HOVER_CARD_ACCOUNT_SELECTOR = '[data-hover-card-account]';

export const findHoverCardAnchor = (element: HTMLElement): HTMLElement | null =>
  element.closest<HTMLElement>(HOVER_CARD_ACCOUNT_SELECTOR);
