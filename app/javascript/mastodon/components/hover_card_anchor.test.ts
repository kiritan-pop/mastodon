import { findHoverCardAnchor } from './hover_card_anchor';

describe('findHoverCardAnchor', () => {
  test('returns the element when it has the attribute', () => {
    const anchor = document.createElement('a');
    anchor.setAttribute('data-hover-card-account', '123');

    expect(findHoverCardAnchor(anchor)).toBe(anchor);
  });

  test('returns the nearest ancestor with the attribute', () => {
    const anchor = document.createElement('span');
    anchor.setAttribute('data-hover-card-account', '123');
    const child = document.createElement('img');
    anchor.append(child);

    expect(findHoverCardAnchor(child)).toBe(anchor);
  });

  test('returns null when no anchor exists in the ancestry', () => {
    const element = document.createElement('img');

    expect(findHoverCardAnchor(element)).toBeNull();
  });
});
