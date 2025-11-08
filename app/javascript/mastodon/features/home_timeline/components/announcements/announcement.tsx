import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

import { FormattedDate, FormattedMessage } from 'react-intl';

import { dismissAnnouncement } from '@/mastodon/actions/announcements';
import type { ApiAnnouncementJSON } from '@/mastodon/api_types/announcements';
import { AnimateEmojiProvider } from '@/mastodon/components/emoji/context';
import { EmojiHTML } from '@/mastodon/components/emoji/html';
import { useAppDispatch } from '@/mastodon/store';

import { ReactionsBar } from './reactions';

export interface IAnnouncement extends ApiAnnouncementJSON {
  contentHtml: string;
}

interface AnnouncementProps {
  announcement: IAnnouncement;
  selected: boolean;
}

export const Announcement: FC<AnnouncementProps> = ({
  announcement,
  selected,
}) => {
  const { read, id } = announcement;
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Dismiss announcement when it becomes active.
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (selected && !read) {
      dispatch(dismissAnnouncement(id));
    }
  }, [selected, id, dispatch, read]);

  // But visually show the announcement as read only when it goes out of view.
  const [unread, setUnread] = useState(!read);
  useEffect(() => {
    if (!selected && unread !== !read) {
      setUnread(!read);
    }
  }, [selected, unread, read]);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const anchors = node.querySelectorAll<HTMLAnchorElement>('a.profile-emoji');

    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    anchors.forEach((anchor) => {
      anchor.addEventListener('click', handleClick);
      anchor.setAttribute('tabindex', '-1');
      anchor.setAttribute('role', 'presentation');
    });

    return () => {
      anchors.forEach((anchor) => {
        anchor.removeEventListener('click', handleClick);
      });
    };
  }, [announcement.contentHtml]);

  return (
    <AnimateEmojiProvider className='announcements__item'>
      <strong className='announcements__item__range'>
        <FormattedMessage
          id='announcement.announcement'
          defaultMessage='Announcement'
        />
        <span>
          {' · '}
          <Timestamp announcement={announcement} />
        </span>
      </strong>

      <div ref={contentRef}>
        <EmojiHTML
          className='announcements__item__content translate'
          htmlString={announcement.contentHtml}
          extraEmojis={announcement.all_emojis}
        />
      </div>

      <ReactionsBar reactions={announcement.reactions} id={announcement.id} />

      {unread && <span className='announcements__item__unread' />}
    </AnimateEmojiProvider>
  );
};

const Timestamp: FC<Pick<AnnouncementProps, 'announcement'>> = ({
  announcement,
}) => {
  const startsAt = announcement.starts_at && new Date(announcement.starts_at);
  const endsAt = announcement.ends_at && new Date(announcement.ends_at);
  const now = new Date();
  const hasTimeRange = startsAt && endsAt;
  const skipTime = announcement.all_day;

  if (hasTimeRange) {
    const skipYear =
      startsAt.getFullYear() === endsAt.getFullYear() &&
      endsAt.getFullYear() === now.getFullYear();
    const skipEndDate =
      startsAt.getDate() === endsAt.getDate() &&
      startsAt.getMonth() === endsAt.getMonth() &&
      startsAt.getFullYear() === endsAt.getFullYear();
    return (
      <>
        <FormattedDate
          value={startsAt}
          year={
            skipYear || startsAt.getFullYear() === now.getFullYear()
              ? undefined
              : 'numeric'
          }
          month='short'
          day='2-digit'
          hour={skipTime ? undefined : '2-digit'}
          minute={skipTime ? undefined : '2-digit'}
        />{' '}
        -{' '}
        <FormattedDate
          value={endsAt}
          year={
            skipYear || endsAt.getFullYear() === now.getFullYear()
              ? undefined
              : 'numeric'
          }
          month={skipEndDate ? undefined : 'short'}
          day={skipEndDate ? undefined : '2-digit'}
          hour={skipTime ? undefined : '2-digit'}
          minute={skipTime ? undefined : '2-digit'}
        />
      </>
    );
  }
  const publishedAt = new Date(announcement.published_at);
  return (
    <FormattedDate
      value={publishedAt}
      year={
        publishedAt.getFullYear() === now.getFullYear() ? undefined : 'numeric'
      }
      month='short'
      day='2-digit'
      hour={skipTime ? undefined : '2-digit'}
      minute={skipTime ? undefined : '2-digit'}
    />
  );
};
