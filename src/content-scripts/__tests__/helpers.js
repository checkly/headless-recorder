export const waitForRecorderEvents = function (page, amount) {
  return page.waitForFunction(`window.eventRecorder.getEventLog().length >= ${amount || 1}`)
}

export const getEventLog = function (page) {
  return page.evaluate(() => { return window.eventRecorder.getEventLog() })
}

export const cleanEventLog = function (page) {
  return page.evaluate(() => { return window.eventRecorder.clearEventLog() })
}
