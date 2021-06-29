export const overlaySelectors = {
  OVERLAY_ID: 'headless-recorder-overlay',
  SELECTOR_ID: 'headless-recorder-selector',
  CURRENT_SELECTOR_CLASS: 'headless-recorder-selected-element',
  CURSOR_CAMERA_CLASS: 'headless-recorder-camera-cursor',
  FLASH_CLASS: 'headless-recorder-flash',
}

export const overlayActions = {
  COPY: 'COPY',
  STOP: 'STOP',
  CLOSE: 'CLOSE',
  PAUSE: 'PAUSE',
  UNPAUSE: 'UNPAUSE',
  RESTART: 'RESTART',
  FULL_SCREENSHOT: 'FULL_SCREENSHOT',
  CLIPPED_SCREENSHOT: 'CLIPPED_SCREENSHOT',
  ABORT_SCREENSHOT: 'ABORT_SCREENSHOT',

  TOGGLE_SCREENSHOT_MODE: 'TOGGLE_SCREENSHOT_MODE',
  TOGGLE_SCREENSHOT_CLIPPED_MODE: 'TOGGLE_SCREENSHOT_CLIPPED_MODE',
  CLOSE_SCREENSHOT_MODE: 'CLOSE_SCREENSHOT_MODE',
  TOGGLE_OVERLAY: 'TOGGLE_OVERLAY',
}
