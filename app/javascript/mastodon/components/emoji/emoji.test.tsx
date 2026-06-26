import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { EMOJI_MODE_TWEMOJI } from '@/mastodon/features/emoji/constants';
import { customEmojiFactory } from '@/testing/factories';

import { CustomEmojiProvider } from './context';
import { Emoji } from './index';

vi.mock('@/mastodon/features/emoji/mode', () => ({
  useEmojiAppState: () => ({
    currentLocale: 'en',
    mode: EMOJI_MODE_TWEMOJI,
    darkTheme: false,
    assetHost: '',
  }),
}));

describe('Emoji profile emoji hover card anchor', () => {
  test('renders data-hover-card-account on profile emoji images', () => {
    render(
      <CustomEmojiProvider
        emojis={[
          customEmojiFactory({
            shortcode: '@test_user',
            account_id: '42',
          }),
        ]}
      >
        <Emoji code=':@test_user:' />
      </CustomEmojiProvider>,
    );

    const img = screen.getByRole('img');

    expect(img.getAttribute('data-hover-card-account')).toBe('42');
  });

  test('does not render data-hover-card-account on regular custom emoji', () => {
    render(
      <CustomEmojiProvider
        emojis={[
          customEmojiFactory({
            shortcode: 'custom',
            account_id: '',
          }),
        ]}
      >
        <Emoji code=':custom:' />
      </CustomEmojiProvider>,
    );

    expect(
      screen.getByRole('img').getAttribute('data-hover-card-account'),
    ).toBe(null);
  });
});
