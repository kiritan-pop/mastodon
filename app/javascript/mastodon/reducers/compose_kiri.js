import {
  COMPOSE_CHANGE_KIRI,
  COMPOSE_SUBMIT_REQUEST_KIRI,
  COMPOSE_SUBMIT_SUCCESS_KIRI,
  COMPOSE_SUBMIT_FAIL_KIRI,
} from '../actions/compose_kiri';
import {
  COMPOSE_SUBMIT_REQUEST,
  COMPOSE_SUBMIT_SUCCESS,
  COMPOSE_SUBMIT_FAIL,
} from '../actions/compose';

import { Map as ImmutableMap } from 'immutable';
import uuid from '../uuid';

const initialState = ImmutableMap({
  text: '',
  is_submitting: false,
  default_privacy: 'public',
  idempotencyKey: null,
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
    default:
      return state;
  }
};
