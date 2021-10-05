import analytics from '../analytics'

describe('trackPageView', () => {
    it('has telemetry', () => {
        const options = {
            extension: {
                telemetry: "data"
            }
        }
        expect(analytics.trackPageView(options)).toBe(window?._gaq?.push(['_trackPageview']));
    })
})

describe('trackPageView', () => {
    it('has no telemetry', () => {
        const options = {}
        expect(analytics.trackPageView(options)).toBe(undefined);
    })
})

describe('trackEvent', () => {
    it('has no telemetry', () => {
        const options = {}
        const event = "event"
        expect(analytics.trackEvent({options, event})).toBe(undefined);
    })
})

describe('trackEvent', () => {
    it('has telemetry', () => {
        const options = {
            extension: {
                telemetry: "data"
            }
        }
        const event = "event"
        expect(analytics.trackEvent({options, event})).toBe(window?._gaq?.push(['_trackEvent', event, 'clicked']));
    })
})