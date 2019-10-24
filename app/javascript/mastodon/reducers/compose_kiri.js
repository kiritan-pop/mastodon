import {
  COMPOSE_CHANGE,        
  COMPOSE_SUBMIT_REQUEST,
  COMPOSE_SUBMIT_SUCCESS,
  COMPOSE_SUBMIT_FAIL,   
} from '../actions/compose_kiri';
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
  switch(action.type) {
  case COMPOSE_CHANGE:
    return state
      .set('text', action.text)
      .set('idempotencyKey', uuid());
  case COMPOSE_SUBMIT_REQUEST:
    return state.set('is_submitting', true);
  case COMPOSE_SUBMIT_SUCCESS:
    return clearAll(state);
  case COMPOSE_SUBMIT_FAIL:
    return state.set('is_submitting', false);
  default:
    return state;
  }
};
