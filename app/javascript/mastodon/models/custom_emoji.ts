import type { RecordOf, List as ImmutableList } from 'immutable';
import { Record as ImmutableRecord, isList } from 'immutable';

import type { ApiCustomEmojiJSON } from 'mastodon/api_types/custom_emoji';

type CustomEmojiShape = Required<ApiCustomEmojiJSON>; // no changes from server shape
export type CustomEmoji = RecordOf<CustomEmojiShape>;

export const CustomEmojiFactory = ImmutableRecord<CustomEmojiShape>({
  shortcode: '',
  static_url: '',
  url: '',
  category: '',
  visible_in_picker: false,
  account_id: '',
});

export type EmojiMap = Record<string, ApiCustomEmojiJSON>;

export function makeEmojiMap(
  emojis: ApiCustomEmojiJSON[] | ImmutableList<CustomEmoji> | undefined | null,
) {
  if (!emojis) {
    return {};
  }

  if (isList(emojis)) {
    return emojis.reduce<EmojiMap>((obj, emoji) => {
      obj[`:${emoji.shortcode}:`] = emoji.toJS();
      return obj;
    }, {});
  } else
    return emojis.reduce<EmojiMap>((obj, emoji) => {
      obj[`:${emoji.shortcode}:`] = emoji;
      return obj;
    }, {});
}
