import escapeTextContentForBrowser from 'escape-html';
import emojify from '../../features/emoji/emoji';
import { unescapeHTML } from '../../utils/html';
import { expandSpoilers } from '../../initial_state';

const domParser = new DOMParser();

const makeEmojiMap = record => record.emojis.reduce((obj, emoji) => {
  obj[`:${emoji.shortcode}:`] = emoji;
  return obj;
}, {});

const profileEmojify = (text, profile_emojis) => {
  var tmp_content = text;
  var match_result = tmp_content.match(/:@(([a-z0-9A-Z_]+([a-z0-9A-Z_\.-]+[a-z0-9A-Z_]+)?)(?:@[a-z0-9\.\-]+[a-z0-9]+)?):/g);
  if (match_result && match_result.length > 0){
    match_result = Array.from(new Set(match_result));
    for (let p of match_result) {
      var regExp = new RegExp(p, "g");
      var shortname = p.slice(1,-1);
      // var img_url = profile_emojis.getIn([shortname, 'url']);
      var img_url = profile_emojis[shortname]['url'];
      if (img_url){
        var replacement = `<img draggable="false" class="emojione" alt="${p}" title="${p}" src="${img_url}" />`;
        tmp_content = tmp_content.replace(regExp, replacement);  
      }
    }
  }
  return tmp_content;
}

export function normalizeAccount(account) {
  account = { ...account };

  const emojiMap = makeEmojiMap(account);
  const displayName = account.display_name.trim().length === 0 ? account.username : account.display_name;

  // account.display_name_html = emojify(escapeTextContentForBrowser(displayName), emojiMap);
  account.display_name_html = profileEmojify(emojify(escapeTextContentForBrowser(displayName), emojiMap), account.profile_emojis);
  // account.note_emojified = emojify(account.note, emojiMap);
  account.note_emojified = profileEmojify(emojify(account.note, emojiMap), account.profile_emojis);

  if (account.fields) {
    account.fields = account.fields.map(pair => ({
      ...pair,
      name_emojified: emojify(escapeTextContentForBrowser(pair.name)),
      value_emojified: emojify(pair.value, emojiMap),
      value_plain: unescapeHTML(pair.value),
    }));
  }

  if (account.moved) {
    account.moved = account.moved.id;
  }

  return account;
}

export function normalizeStatus(status, normalOldStatus) {
  const normalStatus   = { ...status };
  normalStatus.account = status.account.id;

  if (status.reblog && status.reblog.id) {
    normalStatus.reblog = status.reblog.id;
  }

  if (status.poll && status.poll.id) {
    normalStatus.poll = status.poll.id;
  }

  // Only calculate these values when status first encountered
  // Otherwise keep the ones already in the reducer
  if (normalOldStatus) {
    normalStatus.search_index = normalOldStatus.get('search_index');
    normalStatus.contentHtml = normalOldStatus.get('contentHtml');
    normalStatus.spoilerHtml = normalOldStatus.get('spoilerHtml');
    normalStatus.hidden = normalOldStatus.get('hidden');
  } else {
    const spoilerText   = normalStatus.spoiler_text || '';
    const searchContent = [spoilerText, status.content].join('\n\n').replace(/<br\s*\/?>/g, '\n').replace(/<\/p><p>/g, '\n\n');
    const emojiMap      = makeEmojiMap(normalStatus);

    normalStatus.search_index = domParser.parseFromString(searchContent, 'text/html').documentElement.textContent;
    // normalStatus.contentHtml  = emojify(normalStatus.content, emojiMap);
    normalStatus.contentHtml  = profileEmojify(emojify(normalStatus.content, emojiMap), normalStatus.profile_emojis);
    // normalStatus.spoilerHtml  = emojify(escapeTextContentForBrowser(spoilerText), emojiMap);
    normalStatus.spoilerHtml  = profileEmojify(emojify(escapeTextContentForBrowser(spoilerText), emojiMap), normalStatus.profile_emojis);
    normalStatus.hidden       = expandSpoilers ? false : spoilerText.length > 0 || normalStatus.sensitive;
  }

  return normalStatus;
}

export function normalizePoll(poll) {
  const normalPoll = { ...poll };

  const emojiMap = makeEmojiMap(normalPoll);

  normalPoll.options = poll.options.map(option => ({
    ...option,
    title_emojified: emojify(escapeTextContentForBrowser(option.title), emojiMap),
  }));

  return normalPoll;
}
