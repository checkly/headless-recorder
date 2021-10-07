export default {
  trackEvent({ event, options }) {
    if (options?.extension?.telemetry) {
      window?._gaq?.push(['_trackEvent', event, 'clicked'])
    }
  },

  trackPageView(options) {
    if (options?.extension?.telemetry) {
      window?._gaq?.push(['_trackPageview'])
    }
  },
}
