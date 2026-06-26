import { useCallback, useEffect } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import classNames from 'classnames';

import type { Collection, List, Map as ImmutableMap } from 'immutable';

import CampaignIcon from '@/material-icons/400-24px/campaign.svg?react';
import {
  fetchAnnouncements,
  toggleShowAnnouncements,
} from 'mastodon/actions/announcements';
import { IconWithBadge } from 'mastodon/components/icon_with_badge';
import { Announcements } from 'mastodon/features/home_timeline/components/announcements';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

const messages = defineMessages({
  show_announcements: {
    id: 'home.show_announcements',
    defaultMessage: 'Show announcements',
  },
  hide_announcements: {
    id: 'home.hide_announcements',
    defaultMessage: 'Hide announcements',
  },
});

type AnnouncementsState = ImmutableMap<
  string,
  boolean | List<ImmutableMap<string, unknown>>
>;

const selectHasAnnouncements = (state: {
  announcements: AnnouncementsState;
}): boolean => {
  const items = state.announcements.get('items') as
    | List<ImmutableMap<string, unknown>>
    | undefined;
  return !(items?.isEmpty() ?? true);
};

const selectUnreadAnnouncements = (state: {
  announcements: AnnouncementsState;
}): number => {
  const items = state.announcements.get('items') as
    | Collection<unknown, ImmutableMap<string, unknown>>
    | undefined;
  return items?.count((item) => !item.get('read')) ?? 0;
};

const selectShowAnnouncements = (state: {
  announcements: AnnouncementsState;
}): boolean => {
  const show = state.announcements.get('show');
  return show === true;
};

export const AnnouncementsKiriWrapper: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const hasAnnouncements = useAppSelector(selectHasAnnouncements);
  const unreadAnnouncements = useAppSelector(selectUnreadAnnouncements);
  const showAnnouncements = useAppSelector(selectShowAnnouncements);

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const handleToggleAnnouncementsClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch(toggleShowAnnouncements());
    },
    [dispatch],
  );

  if (!hasAnnouncements) {
    return null;
  }

  return (
    <div className='announcements__kiriwrapper'>
      <button
        type='button'
        className={classNames('column-header__button', {
          active: showAnnouncements,
        })}
        title={intl.formatMessage(
          showAnnouncements
            ? messages.hide_announcements
            : messages.show_announcements,
        )}
        aria-label={intl.formatMessage(
          showAnnouncements
            ? messages.hide_announcements
            : messages.show_announcements,
        )}
        aria-pressed={showAnnouncements ? 'true' : 'false'}
        onClick={handleToggleAnnouncementsClick}
      >
        <IconWithBadge
          id='bullhorn'
          icon={CampaignIcon}
          count={unreadAnnouncements}
          className='column-header__icon'
        />
      </button>
      {showAnnouncements && <Announcements />}
    </div>
  );
};
