import type { FC } from 'react';

import type { CustomEmojiMapArg } from '@/mastodon/features/emoji/types';

import { EmojiHTML } from './emoji/html';

export const RelationshipNoteContent: FC<{
  noteFormatted: string;
  extraEmojis?: CustomEmojiMapArg;
  className?: string;
}> = ({ noteFormatted, extraEmojis, className }) => (
  <EmojiHTML
    htmlString={noteFormatted}
    extraEmojis={extraEmojis}
    className={className}
  />
);
