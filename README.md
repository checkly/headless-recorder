# Puppeteer Recorder

Puppeteer recorder is a Chrome extension that records your browser interactions and generates a 
[Puppeteer](https://github.com/GoogleChrome/puppeteer) script.


## Known issues

- When navigating between pages, the script is only injected when the full navigation is done, 'committed' in Chrome extension
speak. This means you might be able to see the page and click on stuff, but no events are recorded.

- Restarting a recording reloads the extension in the background. This is annoying and has to do with state, handlers
and open message connections between parts of the extension misfiring.


## Credits & disclaimer

Puppeteer recorder is the spiritual successor & love child of segment.io's 
[Daydream](https://github.com/segmentio/daydream) and [ui recorder](https://github.com/yguan/ui-recorder).

