export default {
  trackEvent({ event, options }) {
    if (options?.extension?.telemetry) {
      window?._gaq?.push(['_trackEvent', event, 'clicked'])
    }
  },

  trackPageView(options) {
    console.log('ACA', options?.extension?.telemetry)
    if (options?.extension?.telemetry) {
      window?._gaq?.push(['_trackPageview'])
    }
  },
}
