import Block from './Block'
import pptrActions from './pptr-actions'

export const defaults = {
  wrapAsync: true,
  headless: true,
  waitForNavigation: true,
  waitForSelectorOnClick: true,
  blankLinesBetweenBlocks: true,
  dataAttribute: '',
  showPlaywrightFirst: false
}

export default class CodeGenerator {
  constructor (options) {
    this._options = Object.assign(defaults, options)
    this._blocks = []
    this._frame = 'page'
    this._frameId = 0
    this._allFrames = {}
    this._screenshotCounter = 1

    this._hasNavigation = false
  }

  _setFrames (frameId, frameUrl) {
    if (frameId && frameId !== 0) {
      this._frameId = frameId
      this._frame = `frame_${frameId}`
      this._allFrames[frameId] = frameUrl
    } else {
      this._frameId = 0
      this._frame = 'page'
    }
  }

  _handleWaitForNavigation () {
    const block = new Block(this._frameId)
    if (this._options.waitForNavigation) {
      block.addLine({type: pptrActions.NAVIGATION, value: `await navigationPromise`})
    }
    return block
  }

  _postProcess () {
    // when events are recorded from different frames, we want to add a frame setter near the code that uses that frame
    if (Object.keys(this._allFrames).length > 0) {
      this._postProcessSetFrames()
    }

    if (this._options.blankLinesBetweenBlocks && this._blocks.length > 0) {
      this._postProcessAddBlankLines()
    }
  }

  _postProcessAddBlankLines () {
    let i = 0
    while (i <= this._blocks.length) {
      const blankLine = new Block()
      blankLine.addLine({ type: null, value: '' })
      this._blocks.splice(i, 0, blankLine)
      i += 2
    }
  }
}
