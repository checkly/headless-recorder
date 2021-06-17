export const controlMessages = {
  EVENT_RECORDER_STARTED: 'EVENT_RECORDER_STARTED',
  GET_VIEWPORT_SIZE: 'GET_VIEWPORT_SIZE',
  GET_CURRENT_URL: 'GET_CURRENT_URL',
  GET_SCREENSHOT: 'GET_SCREENSHOT',

  OVERLAY_STOP: 'OVERLAY_STOP',
  OVERLAY_PAUSE: 'OVERLAY_PAUSE',
  OVERLAY_FULL_SCREENSHOT: 'OVERLAY_FULL_SCREENSHOT',
  OVERLAY_CLIPPED_SCREENSHOT: 'OVERLAY_CLIPPED_SCREENSHOT',
  OVERLAY_ABORT_SCREENSHOT: 'OVERLAY_ABORT_SCREENSHOT',
}

export const uiActions = {
  TOGGLE_SCREENSHOT_MODE: 'TOGGLE_SCREENSHOT_MODE',
  TOGGLE_SCREENSHOT_CLIPPED_MODE: 'TOGGLE_SCREENSHOT_CLIPPED_MODE',
  CLOSE_SCREENSHOT_MODE: 'CLOSE_SCREENSHOT_MODE',
  TOGGLE_OVERLAY: 'TOGGLE_OVERLAY',
  START: 'START',
  STOP: 'STOP',
  CLEAN_UP: 'CLEAN_UP',
  PAUSE: 'PAUSE',
  UN_PAUSE: 'UN_PAUSE',
}

export const headlessActions = {
  GOTO: 'GOTO',
  VIEWPORT: 'VIEWPORT',
  WAITFORSELECTOR: 'WAITFORSELECTOR',
  NAVIGATION: 'NAVIGATION',
  NAVIGATION_PROMISE: 'NAVIGATION_PROMISE',
  FRAME_SET: 'FRAME_SET',
  SCREENSHOT: 'SCREENSHOT',
}

export const overlaySelectors = {
  OVERLAY_ID: 'headless-recorder-overlay',
  CURRENT_SELECTOR_CLASS: 'headless-recorder-selected-element',
  CURSOR_CAMERA_CLASS: 'headless-recorder-camera-cursor',
  FLASH_CLASS: 'headless-recorder-flash',
}

export const eventsToRecord = {
  CLICK: 'click',
  DBLCLICK: 'dblclick',
  CHANGE: 'change',
  KEYDOWN: 'keydown',
  SELECT: 'select',
  SUBMIT: 'submit',
  LOAD: 'load',
  UNLOAD: 'unload',
}

export const headlessTypes = {
  PUPPETEER: 'puppeteer',
  PLAYWRIGHT: 'playwright',
}

export const isDarkMode = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
