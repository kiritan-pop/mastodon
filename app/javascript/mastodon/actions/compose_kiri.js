import api from '../api';
import { updateTimeline } from './timelines';

export const COMPOSE_CHANGE          = 'COMPOSE_CHANGE';
export const COMPOSE_SUBMIT_REQUEST  = 'COMPOSE_SUBMIT_REQUEST';
export const COMPOSE_SUBMIT_SUCCESS  = 'COMPOSE_SUBMIT_SUCCESS';
export const COMPOSE_SUBMIT_FAIL     = 'COMPOSE_SUBMIT_FAIL';

export function changeCompose(text) {
  return {
    type: COMPOSE_CHANGE,
    text: text,
  };
};

export function submitCompose(routerHistory, vis = null) {
  return function (dispatch, getState) {
    const status = getState().getIn(['compose_kiri', 'text'], '');

    if ((!status || !status.length)) {
      return;
    }

    dispatch(submitComposeRequest());

    api(getState).post('/api/v1/statuses', {
      status,
      visibility: vis,
    }, {
      headers: {
        'Idempotency-Key': getState().getIn(['compose_kiri', 'idempotencyKey']),
      },
    }).then(function (response) {
      if (routerHistory && routerHistory.location.pathname === '/statuses/new' && window.history.state) {
        routerHistory.goBack();
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
};

export function submitComposeRequest() {
  return {
    type: COMPOSE_SUBMIT_REQUEST,
  };
};

export function submitComposeSuccess(status) {
  return {
    type: COMPOSE_SUBMIT_SUCCESS,
    status: status,
  };
};

export function submitComposeFail(error) {
  return {
    type: COMPOSE_SUBMIT_FAIL,
    error: error,
  };
};