import {
  SETDEVICE
} from '@stores/actionTypes';

export const initialState = {
  deviceInfo: {}
};

function device(state = initialState, actions) {
  switch (actions.type) {
    case SETDEVICE:
      return {
        ...state,
        deviceInfo: actions.deviceInfo,
      };
    default:
      return state;
  }
}
export default device;
