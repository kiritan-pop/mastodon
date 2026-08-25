import {
  accountFactoryAPI,
  statusFactoryAPI,
  statusFactoryState,
} from './factories';

describe('test factories', () => {
  test('accountFactoryAPI includes all_emojis', () => {
    const account = accountFactoryAPI();

    expect(account.all_emojis).toEqual([]);
    expect(account.emojis).toEqual([]);
  });

  test('statusFactoryAPI includes all_emojis and tagged_collections', () => {
    const status = statusFactoryAPI();

    expect(status.all_emojis).toEqual([]);
    expect(status.tagged_collections).toEqual([]);
    expect(status.content).toBe('<p>This is a test status.</p>');
  });

  test('statusFactoryState preserves all_emojis through normalization', () => {
    const extra = {
      shortcode: 'blobcat',
      url: 'https://example.com/blobcat.png',
      static_url: 'https://example.com/blobcat.png',
      visible_in_picker: true,
      account_id: '1',
    };
    const status = statusFactoryState({ all_emojis: [extra] });

    expect(status.all_emojis).toEqual([extra]);
    expect(status.tagged_collections).toEqual([]);
    expect(status.contentHtml).toContain('This is a test status');
  });
});
