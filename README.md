# Puppeteer Recorder

![](src/images/recorder.png)
Puppeteer recorder is a Chrome extension that records your browser interactions and generates a 
[Puppeteer](https://github.com/GoogleChrome/puppeteer) script. This project is **very much in alpha stage**,
but does the following already:

- Records clicks and type events
- Generates a Puppeteer script
- Shows events being recorded
- Copy to clipboard
- Offers configuration options

## Tips

- hit <kbd>tab</kbd> after you finish typing in an `input` element.
- wait for full page loads on each navigation.


## Background

Writing Puppeteer scripts for scraping, testing and monitoring can be tricky. A recorder / code generator can be helpful,
even if the code isn't perfect. This project builds on other projects (see [disclaimer](#user-content-credits--disclaimer) 
below) but add extensibility, configurability and a smoother UI.

## Development

1. Run: `git clone https://github.com/checkly/puppeteer-recorder.git`
2. Build the project: `cd puppeteer-recorder && npm i && npm run dev`
2. Navigate to chrome://extensions
3. Make sure 'Developer mode' is checked
4. Click Load unpacked extension...
5. Browse to puppeteer-recorder/build and click Select

## Known issues

- For some dark reason, the popup does not open on very first click. Second and following clicks are fine.
- When navigating between pages, the script is only injected when the full navigation is done, 'committed' in Chrome extension
speak. This means you might be able to see the page and click on stuff, but no events are recorded.
- Restarting a recording reloads the extension in the background. This is annoying and has to do with state, handlers
and open message connections between parts of the extension misfiring.


## Credits & disclaimer

Puppeteer recorder is the spiritual successor & love child of segment.io's 
[Daydream](https://github.com/segmentio/daydream) and [ui recorder](https://github.com/yguan/ui-recorder).

## License
MIT
