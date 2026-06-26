import { useCallback } from 'react';

import { useLocation } from 'react-router-dom';

import type { Map as ImmutableMap } from 'immutable';

import Textarea from 'react-textarea-autosize';
import { length } from 'stringz';

import type { StatusVisibility } from '@/mastodon/api_types/statuses';
import type { RootState } from '@/mastodon/store';
import { useAppDispatch, useAppSelector } from '@/mastodon/store';
import AlternateEmailIcon from '@/material-icons/400-24px/alternate_email.svg?react';
import LockIcon from '@/material-icons/400-24px/lock.svg?react';
import PublicIcon from '@/material-icons/400-24px/public.svg?react';
import QuietTimeIcon from '@/material-icons/400-24px/quiet_time.svg?react';
import VisibilityIcon from '@/material-icons/400-24px/visibility-fill.svg?react';
import {
  changeCompose,
  submitCompose,
  syncCompose,
} from 'mastodon/actions/compose_kiri';
import type { IconProp } from 'mastodon/components/icon';
import { IconButton } from 'mastodon/components/icon_button';
import { countableText } from 'mastodon/features/compose/util/counter';

type ComposeKiriState = ImmutableMap<
  'text' | 'is_submitting',
  string | boolean
>;

const selectComposeKiriText = (state: RootState): string => {
  const value = (state.compose_kiri as ComposeKiriState).get('text');
  return typeof value === 'string' ? value : '';
};

const selectComposeKiriIsSubmitting = (state: RootState): boolean => {
  const value = (state.compose_kiri as ComposeKiriState).get('is_submitting');
  return value === true;
};

const getCountableText = (input: string): string =>
  countableText(input) as string;

const isSubmitDisabled = (text: string, isSubmitting: boolean): boolean => {
  const fulltext = getCountableText(text);
  return (
    isSubmitting ||
    length(fulltext) > 500 ||
    (fulltext.length !== 0 && fulltext.trim().length === 0)
  );
};

const shouldHideFAB = (path: string) =>
  /^\/statuses\/|^\/@[^/]+\/\d+|^\/publish|^\/explore|^\/getting-started|^\/start|^\/@[^/]+$/.exec(
    path,
  ) !== null;

const privacyIcon = (privacy: StatusVisibility): IconProp => {
  switch (privacy) {
    case 'direct':
      return AlternateEmailIcon;
    case 'private':
      return LockIcon;
    case 'unlisted':
      return QuietTimeIcon;
    default:
      return PublicIcon;
  }
};

export const FloatingTootArea: React.FC = () => {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();

  const text = useAppSelector(selectComposeKiriText);
  const isSubmitting = useAppSelector(selectComposeKiriIsSubmitting);
  const privacy = useAppSelector(
    (state) => state.compose.get('privacy') as StatusVisibility,
  );
  const localOnly = useAppSelector(
    (state) => state.compose.get('local_only') as boolean,
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      dispatch(changeCompose(e.target.value));
    },
    [dispatch],
  );

  const handleSubmit = useCallback(() => {
    if (isSubmitDisabled(text, isSubmitting)) {
      return;
    }

    dispatch(submitCompose());
  }, [dispatch, isSubmitting, text]);

  const handleBlur = useCallback(() => {
    dispatch(syncCompose(text));
    setTimeout(() => {
      window.scrollTo({ top: 0 });
    }, 300);
  }, [dispatch, text]);

  if (shouldHideFAB(pathname)) {
    return null;
  }

  const disabledButton = isSubmitDisabled(text, isSubmitting);

  const sendIcon = privacyIcon(privacy);

  const renderSendButton = () => (
    <IconButton
      className='button icon-button-kiri'
      icon='pencil'
      iconComponent={sendIcon}
      title='toot'
      expanded
      active={false}
      onClick={handleSubmit}
      style={{ height: undefined, width: undefined, lineHeight: undefined }}
      disabled={disabledButton}
    />
  );

  return (
    <div className='floating-toot-area'>
      {renderSendButton()}
      <Textarea
        className='toot__input'
        placeholder='今なにしてる？'
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {localOnly && (
        <div
          className='floating-toot-area__local-only-indicator'
          title='ローカルのみ'
        >
          <VisibilityIcon />
        </div>
      )}
      {renderSendButton()}
    </div>
  );
};
