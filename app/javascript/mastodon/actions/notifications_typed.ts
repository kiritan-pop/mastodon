import { createAction } from '@reduxjs/toolkit';

import type { ApiNotificationJSON } from 'mastodon/api_types/notifications';

export const notificationsUpdate = createAction(
  'notifications/update',
  ({
    notification,
    usePendingItems,
    playSound,
    aprilfool,
    ...args
  }: {
    notification: ApiNotificationJSON;
    usePendingItems: boolean;
    playSound: boolean;
    aprilfool: boolean;
  }) => {
    let sound;

    if (playSound) {
      if (notification.type === 'reblog') {
        sound = 'faaa';
      } else if (notification.type === 'mention') {
        sound = 'jan';
      } else if (notification.type === 'follow') {
        sound = 'tett';
      } else if (notification.type === 'poll') {
        sound = 'nank';
      } else if (notification.type === 'status') {
        sound = 'bbhr';
      } else if (aprilfool) {
        sound = 'prpr';
      } else {
        sound = 'nade';
      }
    }

    return {
      payload: { ...args, notification },
      meta: { sound },
    };
  },
);
