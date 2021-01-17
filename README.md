<p align="center">
   <br/>
   <!-- headless-recorder Logo
     <img src="https://lh3.googleusercontent.com/zuxp6zCZpdSLqMHyr79oL39-phEVSVOYq2mtyBTkyJBc7A8PsWMTkWfofACaPIP-Vm59hutWx2YSFvfDPir9pCozg8g=w128-h128-e365-rj-sc0x00ffffff" /> -->
   <br/>
   <h1 align="center">Headless Recorder</h1>
   <p align="center">     
     ⭐️ Puppeteer Recorder is now <b>Headless Recorder</b> and supports Playwright! ⭐️   
   </p>
   <br/>
   <p align="center" style="align: center;">
      <img src="https://github.com/checkly/headless-recorder/workflows/Lint%20&%20Build%20&%20Test/badge.svg?branch=master" alt="Github Build"/>
      <img src="https://img.shields.io/chrome-web-store/users/djeegiggegleadkkbgopoonhjimgehda?label=Chrome%20Webstore%20-%20Users" alt="Chrome Webstore Users" />
      <img src="https://img.shields.io/github/issues-pr/checkly/headless-recorder?label=PRs" alt="Github Pull Requests" />
      <img src="https://img.shields.io/chrome-web-store/v/djeegiggegleadkkbgopoonhjimgehda?label=Chrome%20Webstore" alt="Chrome Webstore Users" />
      <img src="https://img.shields.io/github/stars/checkly/headless-recorder?label=Stars" alt="Github Stars" />
      <img src="https://img.shields.io/github/license/checkly/headless-recorder?label=License" alt="License" />
   </p>
</p>


<!-- <h2 align="center">Support</h2> -->

## 🙌 Support

<!--sponsors start-->
<table>
  <tbody>
    <tr>
      <td align="center" valign="middle">
        <h3>Gold Sponsor</h3>
        <a href="https://checklyhq.com?utm_source=github&utm_medium=sponsor-logo-github&utm_campaign=headless-recorder" target="_blank">
          <img width="200px" src="chrome-store/checkly-logo.png?raw=true" alt="Checkly" />
        </a><br />
        <i><sub>Delightful Active Monitoring for Developers</sub></i>
      </td>
      <td align="center" valign="middle">
        <a href="mailto:tim@checklyhq.com" target="_blank">
          <img width="100px" src="https://imgur.com/X1gKuY0.png" alt="Support" />
        <br />
        <div>You?</div></a>
      </td>
      <!-- <td align="center" valign="middle">
        <a href="#" target="_blank"></a>
      </td> -->
    </tr><tr></tr>
  </tbody>
</table>
<!--sponsors end-->

## 📷 Screenshots

![Screenshots](src/images/recorder.png)

## 🖨️ Overview

Headless recorder is a Chrome extension that records your browser interactions and generates a
[Puppeteer](http://pptr.dev/) or [Playwright](https://playwright.dev/) script. Install it from the [Chrome Webstore](https://chrome.google.com/webstore/detail/puppeteer-recorder/djeegiggegleadkkbgopoonhjimgehda) to get started!

Don't forget to check out our sister project [theheadless.dev](https://theheadless.dev/), the open source knowledge base for Puppeteer and Playwright.

This project builds on existing open source projects (see [Credits](#user-content-credits)) but adds extensibility, configurability and a smoother UI. For more information, please see our [documentation](https://www.checklyhq.com/docs/headless-recorder/).

## 🏗️ Features

- Records clicks and type events.
- Add waitForNavigation, setViewPort and other useful clauses.
- Generates a Puppeteer / Playwright script.
- Shows which events are being recorded.
- Copy to clipboard.
- Offers configuration options.
- Allows `data-id` configuration for element selection.

> Note: we only record certain events. See `dom-events-to-record.js` in the code-generator folder for which events. This collection will be expanded in future releases.

## 🔧 Usage

- Click the icon and hit Record.
- Hit <kbd>tab</kbd> after you finish typing in an `input` element.
- Click on links, inputs and other elements.
- Wait for full page load on each navigation. The icon will switch from ![](src/images/icon_rec.png) to ![](src/images/icon_wait.png) to indicate it is ready for more input from you.
- Click Pause when you want to navigate without recording anything. Hit Resume to continue recording.

## 🖥️ Development

1. Run: `git clone https://github.com/checkly/headless-recorder.git`
2. Build the project: `cd headless-recorder && npm i && npm run dev`
2. Navigate to chrome://extensions
3. Make sure 'Developer mode' is checked
4. Click Load unpacked extension...
5. Browse to headless-recorder/build and click Select

## 🚀 Release

1. Bump versions in `package.json` and `manifest.json`
2. Tag the code with the version, i.e. `git tag v0.4.0`
3. Push with tags `git push --tags`
4. Generate a release with **gren**. Make sure all issues associated with the new version are linked to a milestone
with the name of the tag.

```
gren release --override --data-source=milestones --milestone-match="{{tag_name}}"
```

## 🙏 Credits 

Headless recorder is the spiritual successor & love child of segment.io's [Daydream](https://github.com/segmentio/daydream) and [ui recorder](https://github.com/yguan/ui-recorder). 

Headless Recorder was previously named "Puppeteer Recorder".

## 📄 License

Apache 2
