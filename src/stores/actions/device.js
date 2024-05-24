import {
  SETDEVICE
} from '@stores/actionTypes';

export const updateDeviceInfo = (deviceInfo) => ({
  type: SETDEVICE,
  deviceInfo,
});
