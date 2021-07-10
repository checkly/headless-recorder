# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2021-07-08
### Added
- New visual identity by [@nucro](https://twitter.com/nucro).
- In page overlay to handle recording and take screenshots
- Visual feedback when taking screenshots
- New code structure organized in modules and services
- Dark mode support
- Migrate to Vue 3 and dependencies update
- Migrate CSS to Tailwind (except for Overlay components)
- Selector preview while recording
- Restart button while recording
- Allow run scripts directly on Checkly 🦝
- First draft of Vuex shared store

### Changed
- Make Playwright default tab
- Use non-async wrap as default
- Full page screenshots use `fullPage` property
- Replace clipped screenshots with element screenshots
- Improve selector generation giving relevance to `ID` and `data-attributes` [#64](https://github.com/checkly/headless-recorder/issues/64)
- General bug fixing
- Improve code reusability and events management

### Removed
- Screenshots context menu
- Events recording list

<br>

## [0.8.2] - 2020-12-15

### Changed
- Specify custom key for input record [#111](https://github.com/checkly/headless-recorder/pulls/111)
- Fix input escaping [#119](https://github.com/checkly/headless-recorder/pulls/119)