import { Map as ImmutableMap } from 'immutable';

import {
  COMPOSE_SUBMIT_REQUEST,
  COMPOSE_SUBMIT_SUCCESS,
  COMPOSE_SUBMIT_FAIL,
  COMPOSE_LOCALONLY_CHANGE,
} from '../actions/compose';
import {
  COMPOSE_CHANGE_KIRI,
  COMPOSE_SUBMIT_REQUEST_KIRI,
  COMPOSE_SUBMIT_SUCCESS_KIRI,
  COMPOSE_SUBMIT_FAIL_KIRI,
  COMPOSE_SYNC_KIRI,
} from '../actions/compose_kiri';
import { uuid } from '../uuid';

const initialState = ImmutableMap({
  text: '',
  is_submitting: false,
  default_privacy: 'public',
  idempotencyKey: null,
  local_only: false,
});

function clearAll(state) {
  return state.withMutations(map => {
    map.set('text', '');
    map.set('is_submitting', false);
    map.set('idempotencyKey', uuid());
  });
};

export default function compose(state = initialState, action) {
  switch (action.type) {
    case COMPOSE_CHANGE_KIRI:
      return state
        .set('text', action.text)
        .set('idempotencyKey', uuid());
    case COMPOSE_SUBMIT_REQUEST_KIRI:
    case COMPOSE_SUBMIT_REQUEST:
      return state.set('is_submitting', true);
    case COMPOSE_SUBMIT_SUCCESS_KIRI:
    case COMPOSE_SUBMIT_SUCCESS:
      return clearAll(state);
    case COMPOSE_SUBMIT_FAIL_KIRI:
    case COMPOSE_SUBMIT_FAIL:
      return state.set('is_submitting', false);
    case COMPOSE_LOCALONLY_CHANGE:
      return state.set('local_only', !state.get('local_only'));
    case COMPOSE_SYNC_KIRI:
      return state
        .set('text', action.text)
        .set('local_only', action.local_only);
    default:
      return state;
  }
};
