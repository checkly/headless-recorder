<p align="center">
  <img width="200px" src="./assets/logo.png" alt="Headless Recorder" />
</p>

<p>
  <img height="128" src="https://www.checklyhq.com/images/footer-logo.svg" align="right" />
  <h1>Headless Recorder</h1>
</p>

<p>
  <img src="https://github.com/checkly/headless-recorder/workflows/Lint%20&%20Build%20&%20Test/badge.svg?branch=master" alt="Github Build"/>
  <img src="https://img.shields.io/chrome-web-store/users/djeegiggegleadkkbgopoonhjimgehda?label=Chrome%20Webstore%20-%20Users" alt="Chrome Webstore Users" />
  <img src="https://img.shields.io/chrome-web-store/v/djeegiggegleadkkbgopoonhjimgehda?label=Chrome%20Webstore" alt="Chrome Webstore Version" />
</p>


> 🎥 Headless recorder is a Chrome extension that records your browser interactions and generates a Playwright/Puppeteer script.


<br>
<p align="center">
  <img src="./assets/hr.gif" alt="Headless recorder demo" />
</p>
<br>

## 👀 Overview

Headless recorder is a Chrome extension that records your browser interactions and generates a [Playwright](https://playwright.dev/) or [Puppeteer](http://pptr.dev/)script. Install it from the [Chrome Webstore](https://chrome.google.com/webstore/detail/puppeteer-recorder/djeegiggegleadkkbgopoonhjimgehda) to get started!

This project builds on existing open source projects (see [Credits](#-credits)) but adds extensibility, configurability and a smoother UI. For more information, please check our [documentation](https://www.checklyhq.com/docs/headless-recorder/).

> 🤔 Do you want to learn more about Puppeteer and Playwright? Check our open [Headless Guides](https://www.checklyhq.com/learn/headless/)

<br>

## 🏗️ What you can do?

- Records clicks and type events.
- Add waitForNavigation, setViewPort and other useful clauses.
- Generates a Playwright & Puppeteer script.
- Preview CSS selectors of HTML elements.
- Take full page and element screenshots.
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


<p align="center">
  <a href="https://checklyhq.com?utm_source=github&utm_medium=sponsor-logo-github&utm_campaign=headless-recorder" target="_blank">
  <img width="100px" src="./assets/checkly-logo.png?raw=true" alt="Checkly" />
  </a>
  <br />
  <i><sub>Delightful Active Monitoring for Developers</sub></i>
  <br>
  <b><sub>From Checkly with ♥️</sub></b>
<p>

