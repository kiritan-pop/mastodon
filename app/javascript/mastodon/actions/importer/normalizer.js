import escapeTextContentForBrowser from 'escape-html';
import emojify from '../../features/emoji/emoji';
import { unescapeHTML } from '../../utils/html';
import { expandSpoilers } from '../../initial_state';

const domParser = new DOMParser();

const makeEmojiMap = record => record.emojis.reduce((obj, emoji) => {
  obj[`:${emoji.shortcode}:`] = emoji;
  return obj;
}, {});

const avatarEmojify = (text, avatar_emojis) => {
  var tmp_content = text;
  var match_result = tmp_content.match(/:@(([a-z0-9A-Z_]+([a-z0-9A-Z_\.-]+[a-z0-9A-Z_]+)?)(?:@[a-z0-9\.\-]+[a-z0-9]+)?):/g);
  if (match_result && match_result.length > 0){
    match_result = Array.from(new Set(match_result));
    for (let p of match_result) {
      var regExp = new RegExp(p, "g");
      var shortname = p.slice(1,-1);
      if (shortname in avatar_emojis){
        var img_url = avatar_emojis[shortname]['url'];
        var acct_url = avatar_emojis[shortname]['account_url'];
        var acct_id = avatar_emojis[shortname]['account_id'];
        if (img_url){
          var replacement = `<a href="${acct_url}" class="avatar-emoji" data-account-name="${shortname}" title="${shortname}" target="_blank" rel="noopener"> <img draggable="false" class="emojione" alt="${p}" title="${p}" src="${img_url}" /> </a>`;
          tmp_content = tmp_content.replace(regExp, replacement);  
        }
      }
    }
  }
  return tmp_content;
}

const kiriAminefy = (text) => {
  var tmp_content = text;
  var match_result = tmp_content.match(/(\[\[\[\{\{\{[^\}]+\}\}\}\]\]\])|(\{\{\{\[\[\[[^\]]+\]\]\])\}\}\}/g);
  if (match_result && match_result.length > 0){
    for (let p of match_result) {
      var replacement = `<span class="rubberband"><span class="spin"><span>${p.slice(6,-6)}</span></span></span>`;
      tmp_content = tmp_content.replace(p, replacement);  
    }
  }
  var match_result = tmp_content.match(/(\{\{\{[^\}]+\}\}\})/g);
  if (match_result && match_result.length > 0){
    for (let p of match_result) {
      var replacement = `<span class="rubberband"><span>${p.slice(3,-3)}</span></span>`;
      tmp_content = tmp_content.replace(p, replacement);  
    }
  }
  var match_result = tmp_content.match(/(\[\[\[[^\]]+\]\]\])/g);
  if (match_result && match_result.length > 0){
    for (let p of match_result) {
      var replacement = `<span class="spin"><span>${p.slice(3,-3)}</span></span>`;
      tmp_content = tmp_content.replace(p, replacement);  
    }
  }
  return tmp_content;
}

export function normalizeAccount(account) {
  account = { ...account };

  const emojiMap = makeEmojiMap(account);
  const displayName = account.display_name.trim().length === 0 ? account.username : account.display_name;

  account.display_name_html = avatarEmojify(emojify(escapeTextContentForBrowser(displayName), emojiMap), account.avatar_emojis);
  account.note_emojified = avatarEmojify(emojify(account.note, emojiMap), account.avatar_emojis);

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
    normalStatus.contentHtml  = kiriAminefy(avatarEmojify(emojify(normalStatus.content, emojiMap), normalStatus.avatar_emojis));
    normalStatus.spoilerHtml  = avatarEmojify(emojify(escapeTextContentForBrowser(spoilerText), emojiMap), normalStatus.avatar_emojis);
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
