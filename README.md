<p align="center">
  <img width="200px" src="https://www.checklyhq.com/opensource/headless_recorder_logo.ad00bdc5.svg" alt="Headless Recorder" />
  <h1 align="center">Headless Recorder</h1>
  <br/>
  <p align="center">
    <img src="https://github.com/checkly/headless-recorder/workflows/Lint%20&%20Build%20&%20Test/badge.svg?branch=master" alt="Github Build"/>
    <img src="https://img.shields.io/chrome-web-store/users/djeegiggegleadkkbgopoonhjimgehda?label=Chrome%20Webstore%20-%20Users" alt="Chrome Webstore Users" />
    <img src="https://img.shields.io/chrome-web-store/v/djeegiggegleadkkbgopoonhjimgehda?label=Chrome%20Webstore" alt="Chrome Webstore Version" />
  </p>
</p>

> 🎥 Headless recorder is a Chrome extension that records your browser interactions and generates a Puppeteer or Playwright script.

![headless recorder demo](./chrome-store/hr.gif)

## 📝 Overview

Headless recorder is a Chrome extension that records your browser interactions and generates a
[Puppeteer](http://pptr.dev/) or [Playwright](https://playwright.dev/) script. Install it from the [Chrome Webstore](https://chrome.google.com/webstore/detail/puppeteer-recorder/djeegiggegleadkkbgopoonhjimgehda) to get started!

Don't forget to check out our sister project [theheadless.dev](https://theheadless.dev/), the open source knowledge base for Puppeteer and Playwright.

This project builds on existing open source projects (see [Credits](#-credits)) but adds extensibility, configurability and a smoother UI. For more information, please see our [documentation](https://www.checklyhq.com/docs/headless-recorder/).

<br>

## 🏗️ What you can do?

- Records clicks and type events.
- Add waitForNavigation, setViewPort and other useful clauses.
- Generates a Playwright & Puppeteer script.
- Preview CSS selectors of HTML elements.
- Take full page and clipped screenshots.
- Pause, resume and restart recording.
- Persist latest script in your browser
- Copy to clipboard.
- Run generated scripts directly on [Checkly](https://checklyhq.com)
- Flexible configuration options and dark mode support.
- Allows `data-id` configuration for element selection.

#### Recorded Events
  - `click`
  - `dblclick`
  - `change`
  - `keydown`
  - `select`
  - `submit`
  - `load`
  - `unload`

> This collection will be expanded in future releases. 💪

<br>

## 🔧 How to use?

1. Click the icon and hit the red button.
2. 👉 Hit <kbd>tab</kbd> after you finish typing in an `input` element. 👈
3. Click on links, inputs and other elements.
4. Wait for full page load on each navigation.

    **The icon will switch from <img width="24px" height="24px" src="./chrome-store/rec.png" alt="recording icon"/>
    to <img width="24px" height="24px" src="./chrome-store/wait.png" alt="waiting icon"/> to indicate it is ready for more input from you.**

5. Click Pause when you want to navigate without recording anything. Hit Resume to continue recording.

<br>

## 🖥️ Run Locally

After cloning the project, open the terminal and navigate to project root directory.

```bash
$ npm i # install dependencies

$ npm run serve # run development mode

$ npm run test # run test cases

$ npm run lint # run and fix linter issues

$ npm run build # build and zip for production
```

<br>

## 🧩 Install Locally

1. Open chrome and navigate to extensions page using this URL: [`chrome://extensions`](chrome://extensions).
1. Make sure "**Developer mode**" is enabled.
1. Click "**Load unpacked extension**" button, browse the `headless-recorder/dist` directory and select it.

![](./chrome-store/dev-guide.png)

<br>

## 🚀 Release

1. Bump version using `npm version` (patch, minor, major).
2. Push changes with tags `git push --tags`
3. Generate a release using **gren**: `gren release --override --data-source=milestones --milestone-match="{{tag_name}}"`

> 🚨 Make sure all issues associated with the new version are linked to a milestone with the name of the tag.

<br>

## 🙏 Credits

Headless recorder is the spiritual successor & love child of segment.io's [Daydream](https://github.com/segmentio/daydream) and [ui recorder](https://github.com/yguan/ui-recorder).

<br>

## 📄 License

[MIT](https://github.com/checkly/headless-recorder/blob/master/LICENSE)

<h3 align="center">Supported by</h3>
<p align="center">
  <a href="https://checklyhq.com?utm_source=github&utm_medium=sponsor-logo-github&utm_campaign=headless-recorder" target="_blank">
  <img width="200px" src="chrome-store/checkly-logo.png?raw=true" alt="Checkly" />
  </a>
  <br />
  <i><sub>Delightful Active Monitoring for Developers</sub></i>
<p>

