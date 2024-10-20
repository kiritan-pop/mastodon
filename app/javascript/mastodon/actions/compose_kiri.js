import { browserHistory } from 'mastodon/components/router';

import api from '../api';

import { updateTimeline } from './timelines';

export const COMPOSE_CHANGE_KIRI = 'COMPOSE_CHANGE_KIRI';
export const COMPOSE_SUBMIT_REQUEST_KIRI = 'COMPOSE_SUBMIT_REQUEST_KIRI';
export const COMPOSE_SUBMIT_SUCCESS_KIRI = 'COMPOSE_SUBMIT_SUCCESS_KIRI';
export const COMPOSE_SUBMIT_FAIL_KIRI = 'COMPOSE_SUBMIT_FAIL_KIRI';
export const COMPOSE_SYNC_KIRI = 'COMPOSE_SYNC_KIRI';

export function changeCompose(text) {
  return {
    type: COMPOSE_CHANGE_KIRI,
    text: text,
  };
}

export function submitCompose(vis = null) {
  return function (dispatch, getState) {
    const status = getState().getIn(['compose_kiri', 'text'], '');

    if ((!status || !status.length)) {
      return;
    }

    dispatch(submitComposeRequest());

    api(getState).post('/api/v1/statuses', {
      status,
      visibility: vis ? vis : getState().getIn(['compose', 'privacy']),
    }, {
      headers: {
        'Idempotency-Key': getState().getIn(['compose_kiri', 'idempotencyKey']),
      },
    }).then(function (response) {
      if ((browserHistory.location.pathname === '/statuses/new') && window.history.state) {
        browserHistory.goBack();
      }

      dispatch(submitComposeSuccess({ ...response.data }));

      const insertIfOnline = timelineId => {
        const timeline = getState().getIn(['timelines', timelineId]);

        if (timeline && timeline.get('items').size > 0 && timeline.getIn(['items', 0]) !== null && timeline.get('online')) {
          dispatch(updateTimeline(timelineId, { ...response.data }));
        }
      };

      if (response.data.visibility !== 'direct') {
        insertIfOnline('home');
      }

      if (response.data.in_reply_to_id === null && response.data.visibility === 'public') {
        insertIfOnline('community');
        insertIfOnline('public');
      }
    }).catch(function (error) {
      dispatch(submitComposeFail(error));
    });
  };
}

export function submitComposeRequest() {
  return {
    type: COMPOSE_SUBMIT_REQUEST_KIRI,
  };
}

export function submitComposeSuccess(status) {
  return {
    type: COMPOSE_SUBMIT_SUCCESS_KIRI,
    status: status,
  };
}

export function submitComposeFail(error) {
  return {
    type: COMPOSE_SUBMIT_FAIL_KIRI,
    error: error,
  };
}

export function syncCompose(text) {
  return {
    type: COMPOSE_SYNC_KIRI,
    text: text,
  };
}
