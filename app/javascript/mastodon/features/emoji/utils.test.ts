import {
  anyEmojiRegex,
  isCustomEmoji,
  isUnicodeEmoji,
  stringHasUnicodeFlags,
} from './utils';

describe('isUnicodeEmoji', () => {
  test.concurrent.for([
    ['😊', true],
    ['🇿🇼', true],
    ['🏴‍☠️', true],
    ['🏳️‍🌈', true],
    ['foo', false],
    [':smile:', false],
    ['😊foo', false],
  ] as const)('isUnicodeEmoji("%s") is %o', ([input, expected], { expect }) => {
    expect(isUnicodeEmoji(input)).toBe(expected);
  });
});

describe('isCustomEmoji', () => {
  test.concurrent.for([
    [':smile:', true],
    [':smile_123:', true],
    [':SMILE:', true],
    ['😊', false],
    ['foo', false],
    [':smile', false],
    ['smile:', false],
  ] as const)('isCustomEmoji("%s") is %o', ([input, expected], { expect }) => {
    expect(isCustomEmoji(input)).toBe(expected);
  });
});

describe('stringHasUnicodeFlags', () => {
  test.concurrent.for([
    ['EU 🇪🇺', true],
    ['Germany 🇩🇪', true],
    ['Canada 🇨🇦', true],
    ['São Tomé & Príncipe 🇸🇹', true],
    ['Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿', true],
    ['black flag 🏴', false],
    ['arrr 🏴‍☠️', false],
    ['rainbow flag 🏳️‍🌈', false],
    ['non-flag 🔥', false],
    ['only text', false],
  ] as const)(
    'stringHasFlags has flag in "%s": %o',
    ([text, expected], { expect }) => {
      expect(stringHasUnicodeFlags(text)).toBe(expected);
    },
  );
});

describe('anyEmojiRegex', () => {
  const extractCustomEmojiMatches = (input: string) =>
    Array.from(input.matchAll(anyEmojiRegex()))
      .map((match) => match[0])
      .filter((token) => token.startsWith(':') && token.endsWith(':'));

  test('does not match middle section of hh:mm:ss-like strings', () => {
    expect(extractCustomEmojiMatches('12:11:08 22:11:08')).toEqual([]);
  });

  test.concurrent.for([
    ['v2:11:08', [':11:']],
    ['v2:11:', [':11:']],
    ['2:11:', [':11:']],
    ['v:11:', [':11:']],
    ['2:11:08', [':11:']],
  ] as const)(
    'matches custom emoji in non-time context: "%s"',
    ([input, expected], { expect }) => {
      expect(extractCustomEmojiMatches(input)).toEqual(expected);
    },
  );
});
