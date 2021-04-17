<p align="center">
  <img width="200px" src="https://www.checklyhq.com/opensource/headless_recorder_logo.ad00bdc5.svg" alt="Headless Recorder" />
  <h1 align="center">Headless Recorder</h1>
  <br/>
  <p align="center">
    <img src="https://github.com/checkly/headless-recorder/workflows/Lint%20&%20Build%20&%20Test/badge.svg?branch=master" alt="Github Build"/>
    <img src="https://img.shields.io/chrome-web-store/users/djeegiggegleadkkbgopoonhjimgehda?label=Chrome%20Webstore%20-%20Users" alt="Chrome Webstore Users" />
    <img src="https://img.shields.io/chrome-web-store/v/djeegiggegleadkkbgopoonhjimgehda?label=Chrome%20Webstore" alt="Chrome Webstore Version" />
    <img src="https://img.shields.io/github/license/checkly/headless-recorder?label=License" alt="License" />
  </p>
</p>

> ⭐️ Puppeteer Recorder is now **Headless Recorder** and supports Playwright! ⭐️   

<p align="center">
  <img src="src/images/recorder.png" alt="Headless Recorder Screenshot" />
<p>


## 📝 Overview

Headless recorder is a Chrome extension that records your browser interactions and generates a
[Puppeteer](http://pptr.dev/) or [Playwright](https://playwright.dev/) script. Install it from the [Chrome Webstore](https://chrome.google.com/webstore/detail/puppeteer-recorder/djeegiggegleadkkbgopoonhjimgehda) to get started!

Don't forget to check out our sister project [theheadless.dev](https://theheadless.dev/), the open source knowledge base for Puppeteer and Playwright.

This project builds on existing open source projects (see [Credits](#-credits)) but adds extensibility, configurability and a smoother UI. For more information, please see our [documentation](https://www.checklyhq.com/docs/headless-recorder/).

<br>

## 🏗️ What you can do?

- Records clicks and type events.
- Add waitForNavigation, setViewPort and other useful clauses.
- Generates a Puppeteer / Playwright script.
- Shows which events are being recorded.
- Copy to clipboard.
- Offers configuration options.
- Allows `data-id` configuration for element selection.

> Note: we only record certain events. See `dom-events-to-record.js` in the code-generator folder for which events. This collection will be expanded in future releases.

<br>

## 🔧 How to use?

- Click the icon and hit Record.
- Hit <kbd>tab</kbd> after you finish typing in an `input` element.
- Click on links, inputs and other elements.
- Wait for full page load on each navigation. The icon will switch from ![](src/images/icon_rec.png) to ![](src/images/icon_wait.png) to indicate it is ready for more input from you.
- Click Pause when you want to navigate without recording anything. Hit Resume to continue recording.

<br>

## 🖥️ Development

1. Open the terminal and clone the project: `$ git clone https://github.com/checkly/headless-recorder.git`
1. Access project directory and use npm to install dependencies: `$ cd headless-recorder && npm i`
1. Use the build npm script to build it: `$ npm run dev`
1. Open chrome and navigate to extensions page using this URL: `chrome://extensions` 
1. Make sure 'Developer mode' is enabled
1. Click "Load unpacked extension" button, browse the `headless-recorder/build` directory and select it

<br>

## 🚀 Release

1. Bump versions in `package.json` and `manifest.json`
2. Tag the code with the version, i.e. `git tag v0.4.0`
3. Push with tags `git push --tags`
4. Generate a release using **gren**: `gren release --override --data-source=milestones --milestone-match="{{tag_name}}"`

> ⚠️ Make sure all issues associated with the new version are linked to a milestone
with the name of the tag.

<br>

## 🙏 Credits 

Headless recorder is the spiritual successor & love child of segment.io's [Daydream](https://github.com/segmentio/daydream) and [ui recorder](https://github.com/yguan/ui-recorder). 

<br>

## 📄 License

[Apache 2](https://github.com/checkly/headless-recorder/blob/master/LICENSE)

<h3 align="center">Supported by</h3>
<p align="center">
  <a href="https://checklyhq.com?utm_source=github&utm_medium=sponsor-logo-github&utm_campaign=headless-recorder" target="_blank">
  <img width="200px" src="chrome-store/checkly-logo.png?raw=true" alt="Checkly" />
  </a>
  <br />
  <i><sub>Delightful Active Monitoring for Developers</sub></i>
<p>

